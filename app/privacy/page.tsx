import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/lib/config";

const title = "Privacy Policy – textfromvideos.com";
const description =
  "How textfromvideos.com handles the video URLs you submit, IP addresses used for the free daily limit, transcripts stored for the seven-day cache, and first-party analytics events.";
const canonical = `${SITE_URL}/privacy/`;
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
        alt: "Privacy Policy – textfromvideos.com",
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

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          This page describes what textfromvideos.com collects when you use the
          transcript tool, and how that information is used. It reflects the
          site as it works today. Last updated November 16, 2026.
        </p>

        <article className="mt-16 space-y-12 text-base leading-7 text-muted">
          <section aria-labelledby="privacy-operator-heading">
            <h2
              id="privacy-operator-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Who operates this site
            </h2>
            <p className="mt-4">
              textfromvideos.com is operated by the operator of this website. A
              separate company name and mailing address are not published here.
            </p>
          </section>

          <section aria-labelledby="privacy-service-heading">
            <h2
              id="privacy-service-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              What the service does
            </h2>
            <p className="mt-4">
              The site lets you paste a public TikTok or Instagram Reels URL
              into a form and receive a written transcript. It does not accept
              uploaded video files. You do not create an account, and the site
              does not take payments. If a public video already has official or
              automatic captions, those captions can be turned into text. If
              there is no usable caption track, the audio is transcribed with
              Deepgram. You can copy the result or download TXT, SRT, or VTT.
              Videos longer than three minutes are rejected. You can transcribe
              up to three new public videos per IP address each UTC day. A
              cached result from the last seven days does not count toward that
              limit.
            </p>
          </section>

          <section aria-labelledby="privacy-data-heading">
            <h2
              id="privacy-data-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Information we collect
            </h2>
            <p className="mt-4">
              When you request a transcript, we collect the video URL you
              submit, including the canonical form we resolve it to, and your
              IP address. The IP address is used to enforce the free daily
              limit and a cap on repeated failed attempts. If a transcript is
              produced, we store the plain text and the timestamped subtitle
              file, along with the platform, video id, language, and whether
              the text came from captions or speech-to-text.
            </p>
            <p className="mt-4">
              We also record first-party analytics events named
              transcribe_start, transcribe_success, and copy_click, together
              with your IP address and a small event payload. Quota and failure
              events needed to run the limits, including transcribe_quota and
              transcribe_failure, are stored in the same way. Job records keep
              the submitted URL and the status of that request.
            </p>
            <p className="mt-4">
              We do not ask for your name, email address, or a password. The
              site does not create user accounts and does not process payments.
            </p>
          </section>

          <section aria-labelledby="privacy-storage-heading">
            <h2
              id="privacy-storage-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How transcripts are stored
            </h2>
            <p className="mt-4">
              A successful transcript is stored so the same public video can be
              returned from cache for seven days. During that window, pasting
              the same link again returns the earlier text, SRT, and VTT
              without a new speech-to-text run, and without consuming the daily
              limit. After that seven-day window, a later request is treated as
              a new transcription. The site does not currently publish an
              automatic deletion schedule for older transcript rows, job
              records, or events, and it does not offer a self-service history
              or deletion form, because there are no accounts.
            </p>
          </section>

          <section aria-labelledby="privacy-processors-heading">
            <h2
              id="privacy-processors-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Speech-to-text and other processors
            </h2>
            <p className="mt-4">
              To transcribe a public link, our servers fetch the video from
              TikTok or Instagram. Those platforms receive a request from our
              servers when you submit their URL. If captions are not available,
              the audio is downloaded to a temporary file, sent to Deepgram for
              speech-to-text, and then removed from the temporary directory.
              Deepgram processes that audio under its own terms. Only the
              resulting transcript text and subtitle file are kept for the
              cache described above. The video file itself is not stored as a
              product feature.
            </p>
          </section>

          <section aria-labelledby="privacy-cookies-heading">
            <h2
              id="privacy-cookies-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Cookies and third-party analytics
            </h2>
            <p className="mt-4">
              The transcript tool does not require cookies, and the site does
              not use first-party advertising cookies or account cookies. The
              first-party analytics events listed above are stored on our
              servers. The site can optionally load Google Analytics 4 or
              Plausible if those services have been configured. When those
              scripts are present, the relevant provider may set cookies or
              collect usage data under its own policy. They are not required
              for the tool to work.
            </p>
          </section>

          <section aria-labelledby="privacy-use-heading">
            <h2
              id="privacy-use-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              How we use this information
            </h2>
            <p className="mt-4">
              We use the submitted URL and the resulting transcript to provide
              the tool, to serve cache hits for seven days, and to generate
              TXT, SRT, and VTT downloads. We use IP addresses to enforce the
              free daily limit and failure caps, and to record first-party
              analytics. We do not sell this information, and we do not use the
              transcript tool to run accounts or payments.
            </p>
          </section>

          <section aria-labelledby="privacy-choices-heading">
            <h2
              id="privacy-choices-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Your choices
            </h2>
            <p className="mt-4">
              If you do not want a video transcribed, do not submit the URL. A
              cache hit only returns an existing transcript for seven days; it
              does not start a new speech-to-text run. Because there are no
              accounts, there is no login where you can view or delete a
              personal history. This site does not publish a support email
              address.
            </p>
          </section>

          <section aria-labelledby="privacy-children-heading">
            <h2
              id="privacy-children-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Children
            </h2>
            <p className="mt-4">
              This is a general-purpose website. It is not directed at
              children, and we do not knowingly collect personal information
              from children.
            </p>
          </section>

          <section aria-labelledby="privacy-changes-heading">
            <h2
              id="privacy-changes-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Changes
            </h2>
            <p className="mt-4">
              If this policy changes, we will update this page. The date at the
              top reflects the current version. The{" "}
              <Link href="/terms/" className={linkClass}>
                terms
              </Link>{" "}
              and{" "}
              <Link href="/about/" className={linkClass}>
                about
              </Link>{" "}
              pages describe how the tool works in more general terms.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
