import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Page Not Found – textfromvideos.com",
  description:
    "The page you requested could not be found. Return to the TikTok or Instagram Reels transcript tool.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
          <p className="font-mono text-xs font-semibold tracking-wider text-accent uppercase">
            404 · Page Not Found
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            This page does not exist
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            The link you opened may be broken or the page may have moved. Use
            one of the free transcript tools below instead.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md"
            >
              TikTok transcript generator
            </Link>
            <Link
              href="/instagram-reels-transcript/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-background px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent"
            >
              Instagram Reels transcript
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
