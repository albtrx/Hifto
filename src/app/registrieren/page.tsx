import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signup } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Konto erstellen"
      subtitle="Kostenlos registrieren und loslegen."
      footer={
        <>
          Schon ein Konto?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Jetzt einloggen
          </Link>
        </>
      }
    >
      <form action={signup} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="text-xs text-slate-400">Mindestens 6 Zeichen.</p>
        </div>

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Registrieren
        </button>
      </form>
    </AuthCard>
  );
}
