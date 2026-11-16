import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/lib/config";

const title = "Instagram Reels Transcript – Free Reel to Text";
const description =
  "Paste a public Instagram Reels link and get a clean text transcript. Copy it, or download TXT, SRT, or VTT. Works with public Reels up to three minutes.";
const canonical = `${SITE_URL}/instagram-reels-transcript/`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical,
  },
  openGraph: {
    type: "website",
    url: canonical,
    siteName: "textfromvideos.com",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Instagram Reels Transcript – Free Reel to Text",
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
    question: "Which Instagram Reels links can I paste?",
    answer:
      "The tool accepts public instagram.com/reel/ and instagram.com/reels/ links, /p/ post links, username-prefixed versions of those paths, and Instagram share or /s/ links after they redirect to a recognized Reel or post. You can omit https://, and tracking parameters can stay in place. Profile pages, stories, and YouTube URLs are not supported, and the site does not accept uploaded files.",
  },
  {
    question: "Why can a Reel be harder to transcribe than a TikTok?",
    answer:
      "Reels are more often private, login-gated, or built around a music track rather than speech. If the tool cannot reach the video, it reports that the video is private or could not be reached. If official or automatic captions exist, those are used; otherwise the audio is transcribed with Deepgram. Speech-to-text cannot invent dialogue from a song or read text that exists only on screen.",
  },
  {
    question: "What happens if a Reel is private, music-only, or longer than 3 minutes?",
    answer:
      "A private Reel returns “This video is private.” A deleted or unreachable Reel may return “This video could not be reached. It may be private or deleted.” A music-only Reel, or one with no spoken audio, returns “This video has no usable audio or captions.” A Reel longer than three minutes is rejected with “This video is longer than 3 minutes. The free limit is 3 minutes.”",
  },
  {
    question: "Does a Reels transcript use the same free daily limit as TikTok?",
    answer:
      "Yes. You can transcribe up to three new public videos per IP address each UTC day, and TikTok and Reels share that cap. If you already generated a transcript for that video in the last seven days, the cached result is returned and does not count toward the daily limit.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const linkClass = "font-medium text-accent hover:text-accent-hover";

export default function InstagramReelsTranscriptPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Instagram Reels Transcript
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          This page explains how textfromvideos.com turns a public Instagram
          Reels link into a written transcript. The{" "}
          <Link href="/#get-transcript" className={linkClass}>
            transcribe form
          </Link>{" "}
          itself is on the homepage. Copy a public Reel URL, paste it into that
          form, and choose Get transcript. When the text appears, you can copy
          it or{" "}
          <Link href="/#formats" className={linkClass}>
            download TXT, SRT, or VTT
          </Link>. The site does not accept uploaded video files.
        </p>

        <article className="mt-16 space-y-14 text-base leading-7 text-muted">
          <section aria-labelledby="reels-how-to-heading">
            <h2
              id="reels-how-to-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How to transcribe an Instagram Reel
            </h2>
            <p className="mt-4">
              The flow matches the{" "}
              <Link href="/#how-to" className={linkClass}>
                how-to on the homepage
              </Link>. Open the Reel in the Instagram app or on the website and copy
              the link for that single video, not a profile or a hashtag feed.
              Paste the URL into the{" "}
              <Link href="/#get-transcript" className={linkClass}>
                form on the homepage
              </Link>{" "}
              and click Get transcript. If the Reel is public, includes spoken
              audio, and is no longer than three minutes, the transcript appears
              on that same page in a few seconds. You can then copy the plain
              text or download TXT, SRT, or VTT.
            </p>
          </section>

          <section aria-labelledby="reels-links-heading">
            <h2
              id="reels-links-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Which Reels links the tool accepts
            </h2>
            <p className="mt-4">
              The tool accepts several public Instagram URL shapes, as long as
              the address points to a single Reel or post. A standard Reel link
              looks like instagram.com/reel/ followed by the short code for that
              video. The same Reel also works when the path uses
              instagram.com/reels/; that form is treated as a Reel and
              normalized to the usual /reel/ address. A /p/ post link is
              accepted as well, including the username-prefixed forms
              instagram.com/username/reel/, instagram.com/username/reels/, and
              instagram.com/username/p/.
            </p>
            <p className="mt-4">
              You can paste the URL with or without https://. Addresses on
              www.instagram.com, m.instagram.com, other instagram.com
              subdomains, and instagr.am are recognized in the same way.
              Tracking parameters at the end of a link can stay in place.
              Instagram share links and short /s/ links are also accepted: the
              site follows the redirect to the public Reel or post they point
              to, and transcription continues if that destination is a
              recognized /reel/, /reels/, or /p/ URL. If the share link does not
              resolve, or you paste a profile, hashtag page, story, or other
              surface that is not a single Reel or post, you will see: “This
              link cannot be recognized. Paste a TikTok or Instagram Reels
              URL.” In that case, paste the full Reel page URL instead. YouTube
              URLs are not supported, and downloaded files cannot be uploaded.
            </p>
          </section>

          <section aria-labelledby="reels-harder-heading">
            <h2
              id="reels-harder-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Why Reels can be harder to transcribe than TikTok
            </h2>
            <p className="mt-4">
              The steps are the same for both platforms, but Instagram Reels are
              often harder to fetch and transcribe than TikTok videos. Many
              Reels are limited to a private or close-friends audience, or they
              can only be opened while signed in. When the tool cannot reach the
              video, it reports that the video is private, or that it could not
              be reached and may be private or deleted. A Reel that is not
              publicly viewable will not produce a transcript, even if you can
              watch it in your own Instagram account.
            </p>
            <p className="mt-4">
              Reels are also more often built around a music track than around
              speech. If official or automatic captions are attached to the
              Reel, those captions can be turned into text and timestamped
              files. If there is no usable caption track, the audio is sent to
              speech-to-text. When no captions are available, that step uses
              Deepgram. It can capture spoken words even when the creator never
              published a subtitle file. It cannot invent dialogue from a song,
              and it cannot read text that exists only in the picture.
            </p>
          </section>

          <section aria-labelledby="reels-limits-heading">
            <h2
              id="reels-limits-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              What happens with private Reels, music-only Reels, long videos,
              and missing audio
            </h2>
            <p className="mt-4">
              If the Reel is private, friends-only, or otherwise not publicly
              available, the response is: “This video is private.” If the Reel
              has been deleted or cannot be opened, you may instead see: “This
              video could not be reached. It may be private or deleted.” Switch
              to a public Reel that anyone can open from the link, without
              signing in. If the Reel is longer than three minutes, the request
              is rejected before a new speech-to-text run, with the message:
              “This video is longer than 3 minutes. The free limit is 3
              minutes.” That cutoff is a hard limit, not a preview of a longer
              transcript. Choose a shorter public Reel, or use a clip that
              stays within 180 seconds. The homepage explains the{" "}
              <Link href="/#free-quota" className={linkClass}>
                free quota and the 3-minute limit
              </Link>{" "}
              in more detail.
            </p>
            <p className="mt-4">
              If the Reel has no usable audio or captions, the response is:
              “This video has no usable audio or captions.” That is the usual
              result for a music-only Reel, a silent clip, a clip that is too
              quiet, or a clip whose words exist only as on-screen text. Try a
              Reel in which someone is clearly speaking. On-screen captions
              burned into the video are part of the picture; they are not a
              caption track the tool can import. A request can also time out
              while the Reel is being fetched or transcribed. In that case the
              message is: “Processing timed out. Please try again.” Do not keep
              pressing the button on a Reel that just failed. Repeated failures
              are capped so the same broken link cannot keep using
              speech-to-text capacity. If too many attempts have already failed
              today, you will see: “Too many failed transcript attempts today.
              Please try again tomorrow.”
            </p>
          </section>

          <section aria-labelledby="reels-compare-heading">
            <h2
              id="reels-compare-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Free daily limit, cache, and how this compares with TikTok
            </h2>
            <p className="mt-4">
              Unpaid transcripts are limited to three new public videos per IP
              address each UTC day. The same cap applies to TikTok and Reels
              together; it is not three of each. When you reach the cap, the
              form shows: “You&apos;ve reached today&apos;s free limit of 3
              transcripts. Please try again tomorrow.” A cached result does not
              consume that daily quota. Successful transcripts are stored for
              seven days by video id. If you paste the same public Reel again
              during that window, the earlier text, SRT, and VTT come back from
              cache.
            </p>
            <p className="mt-4">
              On both platforms you paste a public link into the same form, then
              copy or download TXT, SRT, or VTT. Captions are used when they
              exist; otherwise the audio is transcribed with Deepgram. The
              differences are mostly about the link and the fetch. TikTok
              accepts long /@username/video/ links, /share/video/ links, and
              short links such as vm.tiktok.com, vt.tiktok.com, and
              tiktok.com/t/. Instagram accepts /reel/, /reels/, and /p/ links,
              including username-prefixed versions, plus Instagram share and
              /s/ links after they redirect to a recognized Reel or post. Reels
              are more likely to be private, login-gated, or music-only, so they
              fail more often at the fetch or audio stage.
            </p>
            <p className="mt-4">
              If you need a shorter overview, the{" "}
              <Link href="/#faq" className={linkClass}>
                homepage FAQ
              </Link>{" "}
              includes a{" "}
              <Link href="/#faq-reels" className={linkClass}>
                brief answer about Instagram Reels
              </Link>. When you have a public, spoken, under-three-minute Reel link, go
              back to the{" "}
              <Link href="/#get-transcript" className={linkClass}>
                homepage form
              </Link>{" "}
              and paste it there.
            </p>
          </section>
          <section className="mt-12" aria-labelledby="reels-faq-heading">
            <h2
              id="reels-faq-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              FAQ
            </h2>
            <dl className="mt-6 space-y-6 text-base leading-7 text-muted">
              {faq.map((item) => (
                <div key={item.question}>
                  <dt className="text-lg font-medium text-ink">{item.question}</dt>
                  <dd className="mt-2">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
