import type { Metadata } from "next";
import Link from "next/link";
import { TranscriptForm } from "@/components/TranscriptForm";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "TikTok Transcript Generator – Free Video to Text",
  description:
    "Paste a TikTok or Instagram Reels link and get a clean text transcript in seconds. Copy it, or download TXT / SRT with timestamps.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

const faq = [
  {
    question: "How do I get a transcript from a TikTok video?",
    answer:
      "Paste the TikTok link above and click Get transcript. You can copy the text or download it as TXT or SRT.",
  },
  {
    question: "Does this work with Instagram Reels?",
    answer:
      "Yes. Paste an Instagram Reels link the same way you would paste a TikTok link.",
  },
  {
    question: "Is YouTube supported?",
    answer:
      "Not yet. This tool currently focuses on TikTok and Instagram Reels.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. Short public videos can be transcribed for free, with a daily limit.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          textfromvideos.com
        </Link>
        <Link
          href="/instagram-reels-transcript"
          className="text-sm text-muted hover:text-ink"
        >
          Instagram Reels
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Free TikTok Transcript Generator
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Paste a TikTok or Instagram Reels link and get a clean text transcript
          in seconds. Copy it, or download TXT / SRT with timestamps.
        </p>

        <div className="mt-8">
          <TranscriptForm />
        </div>

        <section className="mt-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-ink">
            FAQ
          </h2>
          <dl className="mt-6 space-y-6">
            {faq.map((item) => (
              <div key={item.question}>
                <dt className="text-lg font-medium text-ink">{item.question}</dt>
                <dd className="mt-2 text-base leading-7 text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-5 py-8 text-sm text-muted">
        Free for public TikTok and Instagram Reels videos up to 3 minutes, with a
        daily limit.
      </footer>
    </div>
  );
}
