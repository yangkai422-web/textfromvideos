import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TranscriptForm } from "@/components/TranscriptForm";
import { SITE_URL } from "@/lib/config";

const title = "Instagram Reels Transcript – Free Reel to Text";
const description =
  "Paste a public Instagram Reels link to convert Instagram Reels to text in seconds. Free Reels transcript generator with TXT, SRT, and VTT downloads.";
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
    question: "Which Reel links work in this Reels transcript generator?",
    answer:
      "Paste public instagram.com/reel/ and instagram.com/reels/ links, /p/ post links, username-prefixed paths, or Instagram share and /s/ links that redirect to a public Reel or post. You can omit https:// and keep tracking parameters. Profile pages, stories, YouTube URLs, and uploaded files are not supported.",
  },
  {
    question: "How do I download TXT, SRT, or VTT files from a Reel?",
    answer:
      "Paste a public Reel link into the form at the top of this page and click Get transcript. Once the text appears on the same page, copy the plain text or click TXT, SRT, or VTT to download your files right away.",
  },
  {
    question: "Why can a Reel fail when I try to turn a Reel into text?",
    answer:
      "Private, login-gated, deleted, or music-only Reels cannot be transcribed. A private Reel returns “This video is private.” A music-only or silent Reel returns “This video has no usable audio or captions.” Any Reel over three minutes returns “This video is longer than 3 minutes. The free limit is 3 minutes.”",
  },
  {
    question: "Is the free daily limit shared between Reels and TikTok?",
    answer:
      "Yes. You get up to three new public transcripts per IP address each UTC day across Reels and TikTok combined. If a Reel was transcribed within the last seven days, the cached result is returned without counting toward your daily limit.",
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
      name: "Instagram Reels Transcript Generator",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: canonical,
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

export default function InstagramReelsTranscriptPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16">
        <h1 className="max-w-2xl text-[32px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
          Instagram Reels Transcript
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:mt-4 sm:text-lg sm:leading-8">
          Paste a public Reel URL below to convert Instagram Reels to text in
          seconds. This free Instagram Reels transcript tool runs in your
          browser with no sign-up—copy the spoken words or download Instagram
          Reels transcript files as TXT, SRT, or VTT. Public Reels up to three
          minutes are supported; uploaded video files are not accepted.
        </p>

        <div id="get-transcript" className="mt-6 sm:mt-8">
          <TranscriptForm
            placeholder="Paste a public Instagram Reels link"
            emptyError="Paste a public Instagram Reels or TikTok URL first."
            inputLabel="Instagram Reels link"
          />
        </div>

        <article className="mt-16 space-y-14 text-base leading-7 text-muted">
          <section aria-labelledby="reels-how-to-heading">
            <h2
              id="reels-how-to-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How this Reels transcript generator turns a Reel into text
            </h2>
            <p className="mt-4">
              Getting an Instagram Reels transcript takes three steps on this
              page:
            </p>
            <ol className="mt-5 space-y-3">
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  1
                </span>
                <div>
                  <p className="font-medium text-ink">Copy the single Reel link</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Open the Reel in the Instagram app or on the web and copy
                    the link to that single video, not a profile or hashtag
                    feed.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  2
                </span>
                <div>
                  <p className="font-medium text-ink">Paste into the form above</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Paste the URL into the{" "}
                    <a href="#get-transcript" className={linkClass}>
                      form above
                    </a>{" "}
                    and click Get transcript.
                  </p>
                </div>
              </li>
              <li className="flex gap-3.5 rounded-xl border border-line bg-card p-4 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  3
                </span>
                <div>
                  <p className="font-medium text-ink">Copy or save your files</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Wait a few seconds for the spoken text to appear right below
                    the box, then copy it or download TXT, SRT, or VTT.
                  </p>
                </div>
              </li>
            </ol>
            <p className="mt-5">
              Use this Reels transcript generator when you want to repost a
              Reel’s main takeaway to X as plain text instead of sharing a video
              link, or pull an exact quote into a newsletter or research doc.
              When you get the words out of a Reel in seconds, it is much easier
              to study a creator’s hook, summarize a short tutorial, or search
              what was said without replaying the clip line by line.
            </p>
            <figure className="mt-6 rounded-2xl border border-line bg-card p-3 shadow-xs sm:p-4">
              <img
                src="/images/instagram-reels-transcript-example.webp"
                alt="Instagram Reels transcript result showing a public Reel link converted into plain text with Copy text, TXT, SRT, and VTT download buttons"
                width={760}
                height={312}
                loading="lazy"
                className="h-auto w-full rounded-xl border border-line/70"
              />
              <figcaption className="mt-2.5 text-xs text-muted">
                Real output from a public Instagram Reel: paste the link, wait a
                few seconds, then copy or download TXT, SRT, and VTT.
              </figcaption>
            </figure>

            <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink">
              Download Instagram Reels transcript files in TXT, SRT, or VTT
            </h3>
            <p className="mt-3">
              Once the text loads, you can copy it in one click or save files in
              three formats. Check the{" "}
              <Link href="/#formats" className={linkClass}>
                TXT, SRT, and VTT format guide
              </Link>{" "}
              for details on when each subtitle wrapper fits best:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  TXT
                </span>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  Clean paragraphs to paste into X posts, blog drafts,
                  newsletters, or team notes without timecodes.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  SRT
                </span>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  Timestamped subtitle cues ready to import into desktop video
                  editors and captioning tools.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
                <span className="inline-block rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                  VTT
                </span>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  WebVTT captions built for HTML5 video embeds and browser-based
                  media players.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="reels-links-heading">
            <h2
              id="reels-links-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Which Reel links work when you turn a Reel into text
            </h2>
            <p className="mt-4">
              The Reels transcript generator accepts public Instagram URLs that
              point to a single Reel or video post. Standard links use
              instagram.com/reel/ followed by the video’s short code, and
              instagram.com/reels/ links are normalized to the same Reel
              address. Public /p/ post links work too, including
              username-prefixed paths such as instagram.com/username/reel/,
              instagram.com/username/reels/, and instagram.com/username/p/.
            </p>
            <p className="mt-4">
              You can paste a link with or without https://, and tracking
              parameters at the end of the URL can stay in place. Addresses on
              www.instagram.com, m.instagram.com, other instagram.com
              subdomains, and instagr.am are all recognized. Instagram share
              links and short /s/ links are followed to their destination Reel
              or post before transcription starts. If a share link does not
              resolve, or you paste a profile, story, or hashtag page, the form
              returns: “This link cannot be recognized. Paste a TikTok or
              Instagram Reels URL.” Paste the direct Reel page link instead.
              YouTube URLs and uploaded video files are not supported.
            </p>
            <p className="mt-4">
              Link shapes also explain why copying a Reel feels slightly
              different from copying a TikTok. TikTok URLs typically use
              /@username/video/ with a numeric ID or short redirect domains like
              vm.tiktok.com and tiktok.com/t/, whereas Instagram mixes short
              alphanumeric codes across /reel/, /reels/, /p/, and /s/ paths.
              Both formats are normalized automatically here—or on our{" "}
              <Link href="/" className={linkClass}>
                free TikTok transcript generator
              </Link>
              —as long as the destination video is public.
            </p>
          </section>

          <section aria-labelledby="reels-audio-heading">
            <h2
              id="reels-audio-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How the tool handles captions, speech, and background music
            </h2>
            <p className="mt-4">
              When you submit a public Reel, the tool first checks whether
              official or automatic captions are attached to the video. If a
              usable caption track exists, those cues are converted into plain
              text and timestamped subtitle files. If the Reel has no captions,
              the audio is transcribed with Deepgram so you still get a clean
              written copy even when the creator never published subtitles—just
              like our{" "}
              <Link href="/" className={linkClass}>
                TikTok transcript
              </Link>{" "}
              tool on the homepage.
            </p>
            <p className="mt-4">
              Reels are more often private, login-gated, or built around
              background music than spoken commentary. A clip that requires
              signing in to view cannot be fetched, even if you can watch it
              inside your own Instagram account. Speech-to-text also cannot
              invent dialogue from a music track or read words that appear only
              as burned-in on-screen text. For the cleanest output when you get
              the words out of a Reel, choose a public clip where someone is
              clearly speaking.
            </p>
          </section>

          <section aria-labelledby="reels-limits-heading">
            <h2
              id="reels-limits-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Private Reels, music-only clips, and the 3-minute limit
            </h2>
            <p className="mt-4">
              If a Reel is private or restricted to close friends, the form
              returns: “This video is private.” If a Reel was deleted or cannot
              be opened publicly, you may see: “This video could not be reached.
              It may be private or deleted.” Reels longer than three minutes are
              rejected before speech-to-text runs with: “This video is longer
              than 3 minutes. The free limit is 3 minutes.” That 180-second
              cutoff is a hard limit rather than a partial preview.
            </p>
            <p className="mt-4">
              If a clip is silent, music-only, or contains only on-screen text,
              the response is: “This video has no usable audio or captions.” If
              fetching or transcribing takes too long, you will see: “Processing
              timed out. Please try again.” Avoid retrying the same broken Reel
              repeatedly—failed attempts are capped per day, and hitting that
              cap shows: “Too many failed transcript attempts today. Please try
              again tomorrow.”
            </p>
          </section>

          <section aria-labelledby="reels-quota-heading">
            <h2
              id="reels-quota-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Free daily quota and 7-day cache
            </h2>
            <p className="mt-4">
              Every free Instagram Reels transcript uses a shared daily
              allowance of three new public videos per IP address each UTC day—a
              practical quota when you want to pull scripts from a few creator
              Reels or turn quick product demos into written notes without
              creating an account. When you hit the daily cap, the tool shows:
              “You&apos;ve reached today&apos;s free limit of 3 transcripts.
              Please try again tomorrow.”
            </p>
            <p className="mt-4">
              Successful transcripts are cached for seven days by video ID, and
              a cached result does not consume your daily quota. If you paste
              the same Reel again within seven days to copy a quote or save TXT,
              SRT, and VTT in another format, the stored files come back
              immediately. The{" "}
              <Link href="/#free-quota" className={linkClass}>
                free quota details
              </Link>{" "}
              apply across both Reels and our{" "}
              <Link href="/" className={linkClass}>
                TikTok transcript generator
              </Link>
              , so the same three-video daily cap covers both platforms.
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
