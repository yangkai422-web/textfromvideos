import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
      <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
        textfromvideos.com
      </Link>
    </header>
  );
}
