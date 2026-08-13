import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function AuthErrorPage() {
  return (
    <AuthCard
      title="Link ungültig oder abgelaufen"
      subtitle="Bitte fordere einen neuen Link an."
      footer={
        <Link href="/login" className="font-semibold text-brand">
          Zurück zum Login
        </Link>
      }
    >
      <p className="text-sm text-slate-600">
        Der Link wurde entweder bereits verwendet oder ist nicht mehr
        gültig.
      </p>
    </AuthCard>
  );
}
