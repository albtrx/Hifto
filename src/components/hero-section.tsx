import { categories } from "@/lib/categories";

export function HeroSection() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Du brauchst etwas?
          <br />
          Frag die Leute in deiner Nähe.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Beschreibe, was du brauchst. Finde Menschen, die dir helfen können.
        </p>

        <form
          action="/anfrage/neu"
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="titel"
            placeholder="Was brauchst du gerade?"
            className="h-14 flex-1 rounded-full border border-slate-300 bg-white px-6 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="h-14 shrink-0 rounded-full bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Anfrage erstellen
          </button>
        </form>

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
