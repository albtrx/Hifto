import { AuthCard } from "@/components/auth-card";

export default function RegisterConfirmPage() {
  return (
    <AuthCard title="Fast geschafft" subtitle="Bestätige deine E-Mail-Adresse">
      <p className="text-sm text-slate-600">
        Wir haben dir eine E-Mail geschickt. Klicke auf den Bestätigungslink
        darin, um dein Konto zu aktivieren.
      </p>
    </AuthCard>
  );
}
