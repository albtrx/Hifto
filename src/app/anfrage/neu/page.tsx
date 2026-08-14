import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { createRequest } from "./actions";

const inputClass =
  "h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

const textareaClass =
  "rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; titel?: string }>;
}) {
  const { error, titel } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/anfrage/neu${titel ? `?titel=${encodeURIComponent(titel)}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Anfrage erstellen
      </h1>
      <p className="mt-2 text-slate-600">
        Beschreib kurz, was du brauchst — andere Nutzer in deiner Nähe können
        dir dann anbieten zu helfen.
      </p>

      <form action={createRequest} className="mt-8 flex flex-col gap-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Field label="Titel">
          <input
            name="title"
            type="text"
            required
            maxLength={100}
            defaultValue={titel}
            placeholder="z. B. Hilfe beim Möbeltransport"
            className={inputClass}
          />
        </Field>

        <Field label="Beschreibung">
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Erzähl kurz, worum es geht..."
            className={textareaClass}
          />
        </Field>

        <Field label="Kategorie">
          <select
            name="category"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Standort">
          <input
            name="location"
            type="text"
            required
            placeholder="z. B. St. Gallen"
            className={inputClass}
          />
        </Field>

        <Field label="Zeitpunkt (optional)">
          <input name="neededAt" type="datetime-local" className={inputClass} />
        </Field>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field label="Budget (optional)">
            <input
              name="budgetAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="80"
              className={inputClass}
            />
          </Field>
          <Field label="Währung">
            <select
              name="budgetCurrency"
              defaultValue="CHF"
              className={inputClass}
            >
              <option value="CHF">CHF</option>
              <option value="EUR">EUR</option>
            </select>
          </Field>
        </div>

        <Field label="Bild (optional)">
          <input
            name="image"
            type="file"
            accept="image/*"
            className="text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20"
          />
        </Field>

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Anfrage veröffentlichen
        </button>
      </form>
    </div>
  );
}
