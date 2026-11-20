import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/lib/config";

const title = "About – textfromvideos.com";
const description =
  "textfromvideos.com is a free tool that turns a public TikTok or Instagram Reels link into a written transcript. No file uploads, accounts, or payments.";
const canonical = `${SITE_URL}/about/`;
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
        alt: "About – textfromvideos.com",
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

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          About textfromvideos.com
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          textfromvideos.com is a free website that turns a public TikTok or
          Instagram Reels link into a written transcript. Last updated November
          20, 2026.
        </p>

        <article className="mt-16 space-y-12 text-base leading-7 text-muted">
          <section aria-labelledby="about-what-heading">
            <h2
              id="about-what-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              What the site does
            </h2>
            <p className="mt-4">
              You paste a public video URL into the{" "}
              <Link href="/#get-transcript" className={linkClass}>
                form on the homepage
              </Link>{" "}
              and choose Get transcript. The site does not accept uploaded
              files. If the video already has official or automatic captions,
              those captions can be turned into text and timestamped files. If
              there is no usable caption track, the audio is transcribed with
              Deepgram. When the text appears, you can copy it or download TXT,
              SRT, or VTT.
            </p>
            <p className="mt-4">
              The tool is built for short, public clips. A video longer than
              three minutes is rejected. You can transcribe up to three new
              public videos per IP address each UTC day. If a successful
              transcript for that video is already on file from the last seven
              days, it is returned from cache and does not count toward the
              daily limit. Private videos, deleted videos, music-only clips,
              and clips with no spoken audio cannot be turned into text.
              YouTube is not supported yet.
            </p>
          </section>

          <section aria-labelledby="about-reels-heading">
            <h2
              id="about-reels-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              TikTok and Instagram Reels
            </h2>
            <p className="mt-4">
              The same form accepts public TikTok links and public Instagram
              Reels links. TikTok accepts long video-page links, share links,
              and short links. Instagram accepts /reel/, /reels/, and /p/
              links, including username-prefixed versions, plus share links
              after they redirect to a recognized Reel or post. The{" "}
              <Link href="/instagram-reels-transcript/" className={linkClass}>
                Instagram Reels transcript
              </Link>{" "}
              page explains Reels link formats, why a Reel can be harder to
              transcribe than a TikTok, and how private, music-only, or long
              Reels are handled. TikTok and Reels share the same free daily
              limit.
            </p>
          </section>

          <section aria-labelledby="about-operator-heading">
            <h2
              id="about-operator-heading"
              className="text-2xl font-semibold tracking-tight text-ink"
            >
              Who operates the site and how to reach us
            </h2>
            <p className="mt-4">
              This site is operated by the operator of textfromvideos.com. A
              separate company name and mailing address are not published here.
              There are no user accounts and no payments on the site. If you
              have questions, feedback, or inquiries about the site, you can
              contact the operator by email at{" "}
              <a href="mailto:yangkai422@gmail.com" className={linkClass}>
                yangkai422@gmail.com
              </a>
              .
            </p>
            <p className="mt-4">
              The{" "}
              <Link href="/privacy/" className={linkClass}>
                privacy policy
              </Link>{" "}
              describes the video URLs, IP addresses, transcripts, advertising
              cookies, and analytics events associated with the site. The{" "}
              <Link href="/terms/" className={linkClass}>
                terms of use
              </Link>{" "}
              describe the limits and your responsibilities when you paste a
              link.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
