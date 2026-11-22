import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
      "Paste a public TikTok link above and click Get transcript to copy text or download TXT, SRT, or VTT.",
  },
  {
    id: "faq-reels",
    question: "Does this work with Instagram Reels?",
    answer:
      "Yes. Public Reels up to three minutes with spoken audio work here or on the Reels page.",
  },
  {
    id: "faq-youtube",
    question: "Is YouTube supported?",
    answer: "Not yet. Only TikTok and Instagram Reels are supported.",
  },
  {
    id: "faq-free",
    question: "Is it free?",
    answer:
      "Yes—three new public videos per IP each UTC day (max 3 minutes). Seven-day cached results do not count.",
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

const linkClass =
  "font-medium text-accent underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent-hover hover:decoration-accent-hover";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16">
        <h1 className="max-w-xl text-[32px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
          Free TikTok Transcript Generator
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:mt-4 sm:text-lg sm:leading-8">
          Paste a public TikTok or Instagram Reels link and get a clean text
          transcript in seconds. Copy it, or download TXT, SRT, or VTT. This
          free TikTok video to text tool works on short public videos, including
          clips that have no captions of their own.
        </p>

        <div id="get-transcript" className="mt-6 sm:mt-8">
          <TranscriptForm />
        </div>

        <article className="mt-16 space-y-14 text-base leading-7 text-muted">
          <section id="overview" aria-labelledby="overview-heading">
            <h2
              id="overview-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Get a clean TikTok transcript in seconds
            </h2>
            <p className="mt-4">
              Whether you search for a TikTok transcript or a tik tok
              transcript, this free TikTok transcript generator and TikTok
              transcript maker turns public short-form videos into clean text in
              seconds. Paste a public link above and the tool checks captions
              first, then runs speech-to-text when no captions exist. Copy your
              TikTok transcript or download TXT, SRT, or VTT for quotes, notes,
              and subtitles—three free new videos per IP each UTC day (up to
              three minutes), with seven-day caching.
            </p>
            <figure className="mt-6 rounded-2xl border border-line bg-card p-3 shadow-xs sm:p-4">
              <img
                src="/images/tiktok-transcript-example.webp"
                alt="Free TikTok transcript generator result showing a pasted public TikTok link converted into plain text with Copy text, TXT, SRT, and VTT download buttons"
                width={760}
                height={368}
                loading="lazy"
                className="h-auto w-full rounded-xl border border-line/70"
              />
              <figcaption className="mt-2.5 text-xs text-muted">
                Real output from a public TikTok link: copy the transcript or
                export TXT, SRT, and VTT right below the input box.
              </figcaption>
            </figure>
          </section>

          <section id="how-to" aria-labelledby="how-to-heading">
            <h2
              id="how-to-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How to get a TikTok transcript
            </h2>
            <p className="mt-4">
              If you are wondering how to get a tiktok video transcript from a
              public clip, it takes three quick steps:
            </p>
            <ol className="mt-5 space-y-3">
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  1
                </span>
                <div>
                  <p className="font-medium text-ink">Copy the public video link</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Copy the link from the TikTok app or website. You can use a
                    long link with the creator’s username, a share link, or a
                    short link.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  2
                </span>
                <div>
                  <p className="font-medium text-ink">Paste the URL and submit</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Paste that URL into the box at the top of this page and
                    click Get transcript.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  3
                </span>
                <div>
                  <p className="font-medium text-ink">Copy or download your transcript</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Wait a few seconds for the spoken text to appear, then copy
                    it or download the TXT, SRT, or VTT file you need.
                  </p>
                </div>
              </li>
            </ol>
            <p className="mt-5">
              This tool offers tiktok video to text transcription free for
              short, public clips. You do not need an app, an account, or manual
              audio work to extract text from TikTok video clips. If a video is
              public, has spoken words, and is under three minutes, you get a
              clean transcript—and repeating the same link within seven days
              serves the cached result immediately.
            </p>
            <p className="mt-4">
              The same form also supports{" "}
              <Link href="/instagram-reels-transcript/" className={linkClass}>
                Instagram Reels transcript
              </Link>{" "}
              links. Private, deleted, or silent clips cannot be turned into
              text.
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
              <a href="#formats" className={linkClass}>
                SRT or VTT
              </a>
              . The{" "}
              <a href="#troubleshooting" className={linkClass}>
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
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  TXT
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  Clean reading text
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A plain-text file with spoken words and punctuation, without
                  timecodes. Use TXT to paste a quote into a document, email,
                  script, or blog post—the on-page Copy text button gives you
                  this same plain transcript.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  SRT
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  Editor subtitle file
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Breaks speech into timed cues for video editors, desktop
                  players, and platforms that ask for a .srt file. Timestamps
                  come from word-level speech timing or the original caption
                  cues.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  VTT
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  WebVTT for web players
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The web-friendly subtitle format built for HTML5 video and
                  browser players. The spoken content matches SRT; only the file
                  wrapper and timestamp punctuation differ for .vtt support.
                </p>
              </div>
            </div>
            <p className="mt-5">
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
              The{" "}
              <Link href="/instagram-reels-transcript/" className={linkClass}>
                Instagram Reels transcript
              </Link>{" "}
              guide explains those URL shapes in more detail, including share
              links and username-prefixed paths. The same rules apply: the Reel must
              be public, it must contain spoken audio, and it must be no longer
              than three minutes. A music-only Reel, a private Reel, or a Reel
              that cannot be reached will not produce a transcript. That guide
              also covers{" "}
              <Link href="/instagram-reels-transcript/" className={linkClass}>
                why Reels can be harder to transcribe than TikTok
              </Link>{" "}
              and how Reels share the same free daily limit.
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
              Every visitor can use our tiktok video to text transcription free
              for short public videos, with two hard limits. First, unpaid
              transcripts are capped at three cache-miss requests per IP address
              each UTC day. If you reach that cap, you will see a clear message
              that today’s free limit is 3 transcripts and that you can try
              again tomorrow. Second, the free duration cutoff is three minutes.
              If a video is longer than 180 seconds, the request is rejected
              before speech-to-text runs, with a message that the free limit is
              3 minutes.
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
              the same failing URL. You can also read how the service handles
              public links and speech-to-text on the{" "}
              <Link href="/about/" className={linkClass}>
                About page
              </Link>
              .
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
              <a href="#supported-links" className={linkClass}>
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
              <a href="#free-quota" className={linkClass}>
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
              speech-to-text credit.
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

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
