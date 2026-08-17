import Link from "next/link";
import { categories } from "@/lib/categories";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, var(--brand-light), transparent)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
          Du brauchst jemanden?
          <br />
          Lass <span className="text-brand">Anbieter</span> zu dir kommen.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Beschreibe deinen Auftrag kostenlos und erhalte passende Angebote
          von Anbietern in deiner Nähe.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/anfrage/neu"
            className="flex h-16 w-full flex-col items-center justify-center rounded-2xl bg-brand px-8 text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 sm:w-auto sm:min-w-64"
          >
            <span className="text-lg font-semibold">Ich brauche etwas</span>
            <span className="text-xs text-white/80">Anfrage erstellen</span>
          </Link>
          <Link
            href="/entdecken"
            className="flex h-16 w-full flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white/60 px-8 text-slate-700 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-lg sm:w-auto sm:min-w-64"
          >
            <span className="text-base font-semibold">
              Ich möchte Aufträge
            </span>
            <span className="text-xs text-slate-500">Anbieter werden</span>
          </Link>
        </div>

        <div className="mt-16">
          <p className="mb-5 text-sm font-medium text-slate-500">
            Beliebte Kategorien
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform group-hover:scale-110 ${category.color}`}
                >
                  {category.emoji}
                </span>
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
