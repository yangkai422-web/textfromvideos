import type { Metadata } from "next";
import Link from "next/link";
import { TranscriptForm } from "@/components/TranscriptForm";
import { SITE_URL } from "@/lib/config";

const title = "TikTok Transcript Generator – Free Video to Text";
const description =
  "Paste a TikTok or Instagram Reels link and get a clean text transcript in seconds. Copy it, or download TXT, SRT, or VTT.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/`,
    siteName: "textfromvideos.com",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TikTok Transcript Generator – Free video to text",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

const faq = [
  {
    id: "faq-tiktok",
    question: "How do I get a transcript from a TikTok video?",
    answer:
      "Paste a public TikTok link into the form at the top of this page and click Get transcript. You can copy the text or download TikTok transcript files as TXT, SRT, or VTT.",
  },
  {
    id: "faq-reels",
    question: "Does this work with Instagram Reels?",
    answer:
      "Yes. Paste a public Instagram Reels link the same way you would paste a TikTok link. The Reel must be public, include spoken audio, and be no longer than three minutes. Music-only or private Reels will not produce a transcript.",
  },
  {
    id: "faq-youtube",
    question: "Is YouTube supported?",
    answer: "Not yet. This tool currently focuses on TikTok and Instagram Reels.",
  },
  {
    id: "faq-free",
    question: "Is it free?",
    answer:
      "Yes. You can transcribe up to three new public videos per IP address each UTC day, and each video can be up to three minutes long. If you already generated a transcript for that video in the last seven days, the cached result is returned and does not count toward the daily limit.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "SoftwareApplication",
      name: "TikTok Transcript Generator",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: `${SITE_URL}/`,
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          textfromvideos.com
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Free TikTok Transcript Generator
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Paste a public TikTok or Instagram Reels link and get a clean text
          transcript in seconds. Copy it, or download TXT, SRT, or VTT. This
          free TikTok video to text tool works on short public videos, including
          clips that have no captions of their own.
        </p>

        <div id="get-transcript" className="mt-8">
          <TranscriptForm />
        </div>

        <article className="mt-16 space-y-14 text-base leading-7 text-muted">
          <section id="how-to" aria-labelledby="how-to-heading">
            <h2
              id="how-to-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How to get a TikTok transcript
            </h2>
            <p className="mt-4">
              Getting a TikTok transcript from a public video takes three steps.
              First, copy the video link from the TikTok app or website. You can
              use a long link that includes the creator’s username, a share
              link, or a short link. Second, paste that URL into the box at the
              top of this page and click Get transcript. Third, wait a few
              seconds for the text to appear, then copy it or download the file
              you need.
            </p>
            <p className="mt-4">
              This TikTok video to text flow is built for short, public clips.
              You do not need to install an app, create an account, or extract
              the audio yourself. If the video is public, includes spoken words,
              and is no longer than three minutes, the generator will try to
              return a clean transcript. Repeating the same video later is
              faster, because a successful result is stored for seven days and
              served again without another speech-to-text run.
            </p>
            <p className="mt-4">
              The same form also accepts a public Instagram Reels link. Paste
              the Reels URL exactly as you would paste a TikTok URL. Private
              videos, deleted videos, and clips with no spoken audio cannot be
              turned into text.
            </p>
            <p className="mt-4">
              If you are new to the tool, start with the{" "}
              <a href="#get-transcript" className="font-medium text-accent hover:text-accent-hover">
                form above
              </a>
              , then read the notes on{" "}
              <a href="#supported-links" className="font-medium text-accent hover:text-accent-hover">
                supported links
              </a>
              ,{" "}
              <a href="#formats" className="font-medium text-accent hover:text-accent-hover">
                file formats
              </a>
              , and the{" "}
              <a href="#free-quota" className="font-medium text-accent hover:text-accent-hover">
                free daily limit
              </a>
              . The{" "}
              <a href="#faq" className="font-medium text-accent hover:text-accent-hover">
                FAQ
              </a>{" "}
              at the bottom answers the most common questions in short form.
            </p>
          </section>

          <section id="no-captions" aria-labelledby="no-captions-heading">
            <h2
              id="no-captions-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How to get text when a video has no captions
            </h2>
            <p className="mt-4">
              Many TikTok videos have no captions at all. Some creators never
              add a caption file. Others rely on burned-in on-screen text, which
              is part of the picture rather than a separate subtitle track. In
              those cases you still need a TikTok transcript if you want to
              quote the spoken words, search the clip, or reuse the dialogue.
            </p>
            <p className="mt-4">
              When you submit a link, the tool first looks for a usable caption
              track attached to the video. If official or automatic captions are
              available, those captions can be converted into plain text and
              timestamped files. If no caption track exists, or the track is
              empty, the tool downloads the audio and sends it to
              speech-to-text. That is how you get text when a video has no
              captions: the audio itself is transcribed.
            </p>
            <p className="mt-4">
              This matters for clips where people talk quickly, hop between
              topics, or speak over music. A TikTok video to text pass will not
              recover words that were never spoken, and it will not read text
              that appears only on screen. It will, however, capture speech even
              when the creator never published a subtitle file. If the result
              looks sparse, check whether the clip is mostly music, sound
              effects, or silent B-roll. Those videos often have nothing for
              speech-to-text to work with.
            </p>
            <p className="mt-4">
              After the transcript appears, you can copy the plain text or
              download a timestamped file. If you need the dialogue in a
              document, start with TXT. If you want to caption the video later,
              use{" "}
              <a href="#formats" className="font-medium text-accent hover:text-accent-hover">
                SRT or VTT
              </a>
              . The{" "}
              <a href="#troubleshooting" className="font-medium text-accent hover:text-accent-hover">
                troubleshooting section
              </a>{" "}
              explains what to do when a request fails.
            </p>
          </section>

          <section id="formats" aria-labelledby="formats-heading">
            <h2
              id="formats-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              When to use TXT, SRT, or VTT
            </h2>
            <p className="mt-4">
              When the transcript is ready, you can copy the text or download
              TikTok transcript files in three formats: TXT, SRT, and VTT.
              Choose the format that matches the job, not the format with the
              longest feature list.
            </p>
            <p className="mt-4">
              TXT is the clean reading version. It is a plain-text file with the
              spoken words and punctuation, without timecodes. Use TXT when you
              want to paste a quote into a document, an email, a script, or a
              blog post. The on-page Copy text button also gives you this same
              plain transcript, so you can grab it without downloading a file.
            </p>
            <p className="mt-4">
              SRT is a subtitle file. It breaks the speech into timed cues so a
              video editor can show captions at the right moment. Use SRT when
              you want to upload captions to an editor, a desktop player, or a
              platform that asks for a .srt file. The timestamps come from
              word-level speech timing when the transcript is produced from
              audio, or from the original caption cues when a caption track was
              available.
            </p>
            <p className="mt-4">
              VTT, or WebVTT, is the web-friendly subtitle format. It also
              includes timestamps, but it is commonly used with HTML5 video and
              web players. If you are adding captions on a website or in a
              player that prefers .vtt files, download VTT instead of SRT. The
              spoken content is the same; only the file wrapper and timestamp
              punctuation differ.
            </p>
            <p className="mt-4">
              You do not have to pick only one. You can copy the text now, then
              come back and download TikTok transcript files in SRT or VTT if
              you later need captions. All three formats are created from the
              same result.
            </p>
          </section>

          <section id="supported-links" aria-labelledby="supported-links-heading">
            <h2
              id="supported-links-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Which link formats are supported
            </h2>
            <p className="mt-4">
              The form accepts public TikTok links in several shapes. A long
              link looks like a regular video page and includes the creator’s
              username, such as tiktok.com/@username/video/ followed by the
              video id. A share link uses the /share/video/ path with that same
              id. Short links from the TikTok app, including vm.tiktok.com,
              vt.tiktok.com, and tiktok.com/t/ addresses, are resolved to the
              underlying video and then transcribed.
            </p>
            <p className="mt-4">
              You can paste the URL with or without https://. Tracking
              parameters at the end of a link are fine; the important part is
              that the address points to one public video. Profile pages,
              hashtag pages, and sounds are not video links, and the form will
              reject them.
            </p>
            <p className="mt-4">
              Public Instagram Reels are supported in the same form. Paste a
              link to a single Reel, including instagram.com/reel/,
              instagram.com/reels/, or a /p/ post link that points to a Reel.
              The same rules apply: the Reel must be public, it must contain
              spoken audio, and it must be no longer than three minutes. A
              music-only Reel, a private Reel, or a Reel that cannot be reached
              will not produce a transcript.
            </p>
            <p className="mt-4">
              YouTube is not supported yet. If you paste a YouTube URL, the tool
              will tell you that the link cannot be recognized. Keep the paste
              box for TikTok and Instagram Reels only, and use a direct video
              URL rather than a screenshot or a downloaded file. This page does
              not accept uploaded video files.
            </p>
          </section>

          <section id="free-quota" aria-labelledby="free-quota-heading">
            <h2
              id="free-quota-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Free quota and the 3-minute limit
            </h2>
            <p className="mt-4">
              The generator is free for short public videos, with two hard
              limits. First, unpaid transcripts are capped at three cache-miss
              requests per IP address each UTC day. If you reach that cap, you
              will see a clear message that today’s free limit is 3 transcripts
              and that you can try again tomorrow. Second, the free duration
              cutoff is three minutes. If a video is longer than 180 seconds,
              the request is rejected before speech-to-text runs, with a message
              that the free limit is 3 minutes.
            </p>
            <p className="mt-4">
              A second request for the same video does not use another free slot
              when a successful transcript is already on file. Results are
              cached for seven days by video id. If you paste the same public
              link again during that window, the earlier text, SRT, and VTT are
              returned from cache. That is why it is worth saving or reusing a
              link you already converted: you can download TikTok transcript
              files again without waiting for a new speech-to-text pass and
              without consuming the daily quota.
            </p>
            <p className="mt-4">
              These limits exist so the shared speech-to-text allowance is not
              exhausted by very long videos or by repeated failed retries. If a
              video already failed recently, the tool will not keep resubmitting
              it to speech-to-text. Try a different public clip, or wait and try
              again later, instead of clicking Get transcript over and over on
              the same failing URL.
            </p>
          </section>

          <section id="troubleshooting" aria-labelledby="troubleshooting-heading">
            <h2
              id="troubleshooting-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How to troubleshoot a failed transcript
            </h2>
            <p className="mt-4">
              Most failed requests come down to the link, the video’s
              visibility, its length, or its audio. Start with the link. Make
              sure you pasted a single video URL, not a profile or a search
              page, and that it is one of the{" "}
              <a href="#supported-links" className="font-medium text-accent hover:text-accent-hover">
                supported link formats
              </a>
              . If a short link does not resolve, try the full video page URL
              from the app’s share sheet.
            </p>
            <p className="mt-4">
              If the video is private, friends-only, or has been deleted, the
              tool cannot reach it and will say so. Switch to a public video. If
              the video is longer than three minutes, shorten the public clip or
              choose a shorter one; the free{" "}
              <a href="#free-quota" className="font-medium text-accent hover:text-accent-hover">
                3-minute cutoff
              </a>{" "}
              is a hard limit, not a preview of a longer transcript.
            </p>
            <p className="mt-4">
              If the response says the video has no usable audio or captions,
              the clip may be silent, music-only, or too quiet for
              speech-to-text. This also happens when the words exist only as
              on-screen text. Try a video where someone is clearly speaking. If
              processing times out, wait a moment and try once more; a temporary
              network issue can interrupt a download. If you have already
              reached today’s free limit of 3 transcripts, wait until the next
              UTC day, or retry a video you already transcribed in the past
              seven days, which can still be served from cache.
            </p>
            <p className="mt-4">
              Do not hammer the button on a video that just failed. Repeated
              failures are capped so the same broken link cannot keep spending
              speech-to-text credit. Use the{" "}
              <a href="#faq" className="font-medium text-accent hover:text-accent-hover">
                FAQ
              </a>{" "}
              if you need a shorter answer, or go back to the{" "}
              <a href="#get-transcript" className="font-medium text-accent hover:text-accent-hover">
                form
              </a>{" "}
              once you have a public, spoken, under-three-minute TikTok or Reels
              link.
            </p>
          </section>
        </article>

        <section className="mt-16" aria-labelledby="faq-heading" id="faq">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-ink">
            FAQ
          </h2>
          <dl className="mt-6 space-y-6">
            {faq.map((item) => (
              <div key={item.question} id={item.id}>
                <dt className="text-lg font-medium text-ink">{item.question}</dt>
                <dd className="mt-2 text-base leading-7 text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-5 py-8 text-sm text-muted">
        Free for public TikTok and Instagram Reels videos up to 3 minutes, with a
        daily limit of 3 new transcripts per IP.
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
