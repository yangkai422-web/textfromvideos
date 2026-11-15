import { TRANSCRIBE_TIMEOUT_MS } from "./config";
import { getCachedTranscript, saveTranscript } from "./cache";
import { ERRORS, isTimeoutError, toPublicError } from "./errors";
import { createJob, updateJob } from "./jobs";
import {
  assertDurationAllowed,
  downloadAudio,
  extractPlatformCaptions,
  inspectMedia,
} from "./media";
import { parseVideoUrl } from "./platform";
import {
  assertFailureRetryCap,
  assertVideoNotRecentlyFailed,
  recordTranscribeFailure,
} from "./failure-cap";
import { assertFreeQuota } from "./rate-limit";
import { asrToPayload, transcribeAudio } from "./asr";
import { buildTranscript, srtToVtt, type TranscriptPayload } from "./transcript-format";

export type TranscribeResponse = TranscriptPayload & {
  cached: boolean;
};

function withVtt(payload: TranscriptPayload): TranscriptPayload {
  if (payload.vtt?.trim()) return payload;
  return { ...payload, vtt: srtToVtt(payload.srt || "") };
}

async function runPipeline(
  url: string,
  ip: string,
  signal: AbortSignal,
): Promise<TranscribeResponse> {
  const parsed = await parseVideoUrl(url, signal);
  const jobId = await createJob(parsed.canonicalUrl);

  try {
    const cached = await getCachedTranscript(parsed.platform, parsed.videoId);
    if (cached?.text || cached?.srt) {
      await updateJob(jobId, "done");
      return { ...withVtt(cached), cached: true };
    }

    await assertVideoNotRecentlyFailed(parsed.platform, parsed.videoId);
    await assertFailureRetryCap(ip);
    await assertFreeQuota(ip);
    await updateJob(jobId, "running");

    const inspection = await inspectMedia(parsed.canonicalUrl, signal);
    assertDurationAllowed(inspection.durationSec);

    const captions = await extractPlatformCaptions(
      parsed.canonicalUrl,
      inspection,
      signal,
    );
    if (captions) {
      const payload = buildTranscript({
        lang: captions.lang,
        source: "captions",
        cues: captions.cues,
      });
      if (payload.text.trim()) {
        await saveTranscript({
          platform: parsed.platform,
          videoId: parsed.videoId,
          payload,
        });
        await updateJob(jobId, "done");
        return { ...withVtt(payload), cached: false };
      }
    }

    const audio = await downloadAudio(parsed.canonicalUrl, signal);
    const asr = await transcribeAudio(audio, signal);
    if (!asr.text.trim() && !asr.cues.length) {
      await updateJob(jobId, "failed", "empty transcript");
      throw ERRORS.noMedia();
    }

    const payload = asrToPayload(asr);
    await saveTranscript({
      platform: parsed.platform,
      videoId: parsed.videoId,
      payload,
    });
    await updateJob(jobId, "done");
    return { ...withVtt(payload), cached: false };
  } catch (error) {
    const publicError = toPublicError(error);
    await updateJob(jobId, "failed", publicError.message);
    await recordTranscribeFailure(ip, parsed.platform, parsed.videoId, publicError);
    throw publicError;
  }
}

export async function transcribeFromUrl(
  url: string,
  ip: string,
): Promise<TranscribeResponse> {
  const signal = AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS);
  try {
    return await runPipeline(url, ip, signal);
  } catch (error) {
    if (isTimeoutError(error)) throw ERRORS.timeout();
    throw toPublicError(error);
  }
}
