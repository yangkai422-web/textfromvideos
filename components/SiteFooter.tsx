import Link from "next/link";

const linkClass = "font-medium text-accent hover:text-accent-hover";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-5 py-8 text-sm text-muted">
      <p>
        Free for public TikTok and Instagram Reels videos up to 3 minutes, with a
        daily limit of 3 new transcripts per IP.
      </p>
      <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
        <Link href="/privacy/" className={linkClass}>
          Privacy
        </Link>
        <Link href="/terms/" className={linkClass}>
          Terms
        </Link>
        <Link href="/about/" className={linkClass}>
          About
        </Link>
      </nav>
    </footer>
  );
}
