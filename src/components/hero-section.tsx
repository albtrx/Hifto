import Link from "next/link";
import { categories } from "@/lib/categories";

export function HeroSection() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Du brauchst jemanden?
          <br />
          Lass Anbieter zu dir kommen.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Beschreibe deinen Auftrag kostenlos und erhalte passende Angebote
          von Anbietern in deiner Nähe.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/anfrage/neu"
            className="flex h-16 w-full flex-col items-center justify-center rounded-2xl bg-brand px-8 text-white shadow-sm transition-colors hover:bg-brand-dark sm:w-auto sm:min-w-64"
          >
            <span className="text-lg font-semibold">Ich brauche etwas</span>
            <span className="text-xs text-white/80">Anfrage erstellen</span>
          </Link>
          <Link
            href="/entdecken"
            className="flex h-16 w-full flex-col items-center justify-center rounded-2xl border border-slate-300 px-8 text-slate-700 transition-colors hover:border-brand hover:text-brand sm:w-auto sm:min-w-64"
          >
            <span className="text-base font-semibold">
              Ich möchte Aufträge
            </span>
            <span className="text-xs text-slate-500">Anbieter werden</span>
          </Link>
        </div>

        <div className="mt-14">
          <p className="mb-4 text-sm font-medium text-slate-500">
            Beliebte Kategorien
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center transition-colors hover:border-brand/40 hover:bg-brand/5"
              >
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-sm font-medium text-slate-700">
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
