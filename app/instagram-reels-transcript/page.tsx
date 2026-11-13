import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Instagram Reels Transcript",
  description:
    "Instagram Reels transcripts are coming soon. You can already paste a Reels link on the homepage.",
  alternates: {
    canonical: `${SITE_URL}/instagram-reels-transcript`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function InstagramReelsTranscriptPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          textfromvideos.com
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Instagram Reels Transcript
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          This page is a placeholder for week 2. You can already paste an
          Instagram Reels link on the homepage to get a transcript.
        </p>
        <p className="mt-8">
          <Link href="/" className="font-medium text-accent hover:text-accent-hover">
            Go to the free transcript tool
          </Link>
        </p>
      </main>
    </div>
  );
}
