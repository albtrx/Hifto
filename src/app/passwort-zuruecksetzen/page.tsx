import { AuthCard } from "@/components/auth-card";
import { updatePassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Neues Passwort"
      subtitle="Wähle ein neues Passwort für dein Konto."
    >
      <form action={updatePassword} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Neues Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Passwort speichern
        </button>
      </form>
    </AuthCard>
  );
}
