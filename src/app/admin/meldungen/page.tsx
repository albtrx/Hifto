import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";
import { setReportStatus } from "../actions";

type ReportRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reported_request_id: string | null;
  reported_user_id: string | null;
  reporter: { full_name: string | null } | null;
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      "id, reason, status, created_at, reported_request_id, reported_user_id, reporter:profiles!reports_reporter_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });

  const list = (reports as unknown as ReportRow[]) ?? [];

  const statusLabel: Record<string, string> = {
    open: "Offen",
    reviewed: "Geprüft",
    dismissed: "Verworfen",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        Meldungen ({list.length})
      </h2>

      {list.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Keine Meldungen.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {list.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    r.status === "open" ? "text-red-600" : "text-slate-400"
                  }`}
                >
                  {statusLabel[r.status]}
                </span>
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(r.created_at)}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-800">{r.reason}</p>

              <p className="mt-1 text-xs text-slate-500">
                Gemeldet von {r.reporter?.full_name ?? "Ein Nutzer"} ·{" "}
                {r.reported_request_id ? (
                  <Link
                    href={`/anfrage/${r.reported_request_id}`}
                    className="text-brand hover:underline"
                  >
                    Anfrage ansehen
                  </Link>
                ) : (
                  <Link
                    href={`/profil/${r.reported_user_id}`}
                    className="text-brand hover:underline"
                  >
                    Profil ansehen
                  </Link>
                )}
              </p>

              {r.status === "open" && (
                <div className="mt-3 flex gap-4">
                  <form action={setReportStatus}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="status" value="reviewed" />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Als geprüft markieren
                    </button>
                  </form>
                  <form action={setReportStatus}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Verwerfen
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
