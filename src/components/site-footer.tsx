import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-slate-500 sm:px-6">
        <span>Hifto</span>
        <Link href="/sicherheit" className="hover:text-brand">
          Sicherheit &amp; Regeln
        </Link>
      </div>
    </footer>
  );
}
