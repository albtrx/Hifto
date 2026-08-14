import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { formatBudget, formatNeededAt, formatRelativeTime } from "@/lib/format";
import { respondToRequest } from "./actions";

type ResponseRow = {
  id: string;
  message: string;
  created_at: string;
  responder_id: string;
  profiles: { full_name: string | null } | null;
};

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; erfolg?: string }>;
}) {
  const { id } = await params;
  const { error, erfolg } = await searchParams;

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === request.user_id;
  const category = categories.find((c) => c.slug === request.category);
  const budget = formatBudget(request.budget_amount, request.budget_currency);

  let alreadyResponded = false;
  let responses: ResponseRow[] = [];

  if (user && !isOwner) {
    const { data: existing } = await supabase
      .from("responses")
      .select("id")
      .eq("request_id", id)
      .eq("responder_id", user.id)
      .maybeSingle();
    alreadyResponded = Boolean(existing);
  }

  if (isOwner) {
    const { data } = await supabase
      .from("responses")
      .select("id, message, created_at, responder_id, profiles(full_name)")
      .eq("request_id", id)
      .order("created_at", { ascending: false });
    responses = (data as unknown as ResponseRow[]) ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/entdecken"
        className="text-sm text-slate-500 hover:text-brand"
      >
        ← Zurück zur Übersicht
      </Link>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {category?.emoji} {request.title}
        </h1>
        {request.is_urgent && (
          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Dringend
          </span>
        )}
      </div>

      {request.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={request.image_url}
          alt=""
          className="mt-4 max-h-80 w-full rounded-2xl object-cover"
        />
      )}

      <p className="mt-4 whitespace-pre-wrap text-slate-700">
        {request.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
        <span>📍 {request.location}</span>
        <span>🕐 {formatNeededAt(request.needed_at)}</span>
        {budget && <span>💰 {budget}</span>}
        <span className="text-slate-400">
          {formatRelativeTime(request.created_at)}
        </span>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-8">
        {isOwner ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Antworten ({responses.length})
            </h2>
            {responses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Noch niemand hat sich gemeldet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {responses.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {r.profiles?.full_name ?? "Ein Nutzer"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{r.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(r.created_at)}
                      </p>
                      <Link
                        href={`/nachrichten/${id}/${r.responder_id}`}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Antworten
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : request.status !== "open" ? (
          <p className="text-sm text-slate-500">
            Diese Anfrage ist bereits geschlossen.
          </p>
        ) : alreadyResponded ? (
          <div>
            <p className="text-sm text-slate-500">
              {erfolg === "1" && "Deine Nachricht wurde gesendet! "}
              Der Ersteller wurde benachrichtigt.
            </p>
            {user && (
              <Link
                href={`/nachrichten/${id}/${user.id}`}
                className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
              >
                Zur Unterhaltung →
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Ich kann helfen
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Schreib dem Ersteller kurz, wie du helfen kannst.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {!user ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/anfrage/${id}`)}`}
                className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Einloggen, um zu helfen
              </Link>
            ) : (
              <form
                action={respondToRequest}
                className="mt-4 flex flex-col gap-3"
              >
                <input type="hidden" name="requestId" value={id} />
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="z. B. Ich hab eine Bohrmaschine und Zeit heute Abend."
                  className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="submit"
                  className="h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Nachricht senden
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
