import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitReport } from "./actions";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; userId?: string; error?: string }>;
}) {
  const { requestId, userId, error } = await searchParams;

  if (!requestId && !userId) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const backTo = requestId ? `/anfrage/${requestId}` : `/profil/${userId}`;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/melden?${requestId ? `requestId=${requestId}` : `userId=${userId}`}`)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {requestId ? "Anfrage melden" : "Nutzer melden"}
      </h1>
      <p className="mt-2 text-slate-600">
        Beschreib kurz, warum du das meldest. Ein Team-Mitglied prüft das.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={submitReport} className="mt-6 flex flex-col gap-4">
        {requestId && <input type="hidden" name="requestId" value={requestId} />}
        {userId && <input type="hidden" name="userId" value={userId} />}
        <input type="hidden" name="backTo" value={backTo} />

        <textarea
          name="reason"
          required
          rows={4}
          placeholder="z. B. Unangemessener Inhalt, Betrugsversuch, ..."
          className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />

        <button
          type="submit"
          className="h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Meldung absenden
        </button>
      </form>
    </div>
  );
}
