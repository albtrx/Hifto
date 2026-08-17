import Link from "next/link";
import { categories } from "@/lib/categories";
import { RotatingPlaceholderInput } from "@/components/rotating-placeholder-input";

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
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Du brauchst jemanden?
          <br />
          Beschreib deinen Auftrag.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Erhalte passende Angebote von Menschen und Unternehmen in deiner
          Nähe.
        </p>

        <form
          action="/anfrage/neu"
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <RotatingPlaceholderInput />
          <button
            type="submit"
            className="h-14 shrink-0 rounded-full bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Anfrage starten
          </button>
        </form>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left">
            <span className="text-2xl">🙋</span>
            <h2 className="mt-2 text-base font-semibold text-slate-900">
              Ich brauche Hilfe
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Stelle einen Auftrag ein und erhalte Angebote.
            </p>
            <Link
              href="/anfrage/neu"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Anfrage erstellen
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left">
            <span className="text-2xl">🧑‍🔧</span>
            <h2 className="mt-2 text-base font-semibold text-slate-900">
              Ich möchte Aufträge
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Finde Menschen in deiner Nähe, die gerade Hilfe benötigen.
            </p>
            <Link
              href="/entdecken"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
            >
              Aufträge entdecken
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <p className="mb-5 text-sm font-medium text-slate-500">
            Beliebte Kategorien
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center transition-colors hover:border-brand/40"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${category.color}`}
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
