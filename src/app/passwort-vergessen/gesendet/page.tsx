import { AuthCard } from "@/components/auth-card";

export default function ForgotPasswordSentPage() {
  return (
    <AuthCard title="E-Mail unterwegs" subtitle="Prüfe dein Postfach">
      <p className="text-sm text-slate-600">
        Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir
        einen Link zum Zurücksetzen deines Passworts geschickt.
      </p>
    </AuthCard>
  );
}
