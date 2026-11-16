import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/lib/config";

const title = "Terms of Use – textfromvideos.com";
const description =
  "Terms for using textfromvideos.com, including the public-link-only transcript tool, the three-minute cutoff, the daily limit of three new transcripts per IP, and the seven-day cache.";
const canonical = `${SITE_URL}/terms/`;
const linkClass = "font-medium text-accent hover:text-accent-hover";

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
        alt: "Terms of Use – textfromvideos.com",
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

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Terms of Use
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          These terms govern your use of textfromvideos.com. Last updated
          November 16, 2026.
        </p>

        <article className="mt-16 space-y-12 text-base leading-7 text-muted">
          <section aria-labelledby="terms-service-heading">
            <h2
              id="terms-service-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              The service
            </h2>
            <p className="mt-4">
              textfromvideos.com is a free website that turns a public TikTok
              or Instagram Reels URL into a written transcript. You paste a
              public link into the form on the{" "}
              <Link href="/#get-transcript" className={linkClass}>
                homepage
              </Link>
              . The site does not accept uploaded video files, does not create
              user accounts, and does not take payments. If official or
              automatic captions are available, those captions can be turned
              into text. Otherwise the audio is transcribed with Deepgram. When
              a transcript is ready, you can copy the text or download TXT,
              SRT, or VTT.
            </p>
          </section>

          <section aria-labelledby="terms-limits-heading">
            <h2
              id="terms-limits-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Limits
            </h2>
            <p className="mt-4">
              Unpaid transcripts are limited to three new public videos per IP
              address each UTC day. TikTok and Instagram Reels share that cap.
              If you already generated a transcript for that video in the last
              seven days, the cached result is returned and does not count
              toward the daily limit. Videos longer than three minutes are
              rejected before a new speech-to-text run. Private, deleted, or
              unreachable videos cannot be transcribed. A music-only clip, a
              silent clip, or a clip with no usable audio or captions will not
              produce a transcript. Repeated failures from the same IP are
              capped. YouTube is not supported.
            </p>
          </section>

          <section aria-labelledby="terms-responsibilities-heading">
            <h2
              id="terms-responsibilities-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Your responsibilities
            </h2>
            <p className="mt-4">
              Only submit public URLs that you are allowed to use. Do not use
              the tool to transcribe private or non-public videos, or to
              violate the terms of TikTok, Instagram, or another platform. You
              are responsible for how you use the transcript, including any
              further copying or publication. Do not attempt to bypass the
              daily limit or the failure cap, and do not send automated traffic
              that disrupts the service.
            </p>
          </section>

          <section aria-labelledby="terms-accuracy-heading">
            <h2
              id="terms-accuracy-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Accuracy and availability
            </h2>
            <p className="mt-4">
              Transcripts may contain errors. Captions and speech-to-text can
              mishear words, miss speakers, or omit text that exists only on
              screen. The site is provided as is, without a warranty that a
              given video will transcribe, that the text will be complete or
              accurate, or that the service will always be available. The
              service may change, be interrupted, or be withdrawn.
            </p>
          </section>

          <section aria-labelledby="terms-rights-heading">
            <h2
              id="terms-rights-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Videos and transcripts
            </h2>
            <p className="mt-4">
              Videos remain on TikTok or Instagram. This site does not claim
              ownership of the underlying video. A transcript is a text
              rendering produced by the tool so you can read or download it,
              subject to the rights in the original video and to applicable
              law.
            </p>
          </section>

          <section aria-labelledby="terms-operator-heading">
            <h2
              id="terms-operator-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Operator and changes
            </h2>
            <p className="mt-4">
              These terms are offered by the operator of textfromvideos.com. A
              separate company name and mailing address are not published on
              this site. If the terms change, we will update this page. The
              date at the top reflects the current version. The{" "}
              <Link href="/privacy/" className={linkClass}>
                privacy policy
              </Link>{" "}
              describes the information the tool collects. The{" "}
              <Link href="/about/" className={linkClass}>
                about
              </Link>{" "}
              page summarizes how the site works.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
