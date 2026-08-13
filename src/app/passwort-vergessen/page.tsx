import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Passwort vergessen?"
      subtitle="Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen."
      footer={
        <Link href="/login" className="font-semibold text-brand">
          Zurück zum Login
        </Link>
      }
    >
      <form action={requestPasswordReset} className="flex flex-col gap-4">
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

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Link schicken
        </button>
      </form>
    </AuthCard>
  );
}
