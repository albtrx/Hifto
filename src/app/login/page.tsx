import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Einloggen"
      subtitle="Schön, dass du wieder da bist."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="font-semibold text-brand">
            Jetzt registrieren
          </Link>
        </>
      }
    >
      <form action={login} className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Passwort
            </label>
            <Link
              href="/passwort-vergessen"
              className="text-sm text-slate-500 hover:text-brand"
            >
              Vergessen?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Einloggen
        </button>
      </form>
    </AuthCard>
  );
}
