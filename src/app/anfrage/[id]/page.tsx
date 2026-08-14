import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { formatBudget, formatNeededAt, formatRelativeTime } from "@/lib/format";
import { respondToRequest, closeRequest, submitReview } from "./actions";

type ResponseRow = {
  id: string;
  message: string;
  created_at: string;
  responder_id: string;
  profiles: { full_name: string | null } | null;
};

const ratingSelectClass =
  "h-10 rounded-lg border border-slate-300 px-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

function RatingField({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select name={name} defaultValue="" className={ratingSelectClass}>
        <option value="">–</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} {"⭐".repeat(n)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; erfolg?: string; bewertet?: string }>;
}) {
  const { id } = await params;
  const { error, erfolg, bewertet } = await searchParams;

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
  const isHelper = user?.id === request.helper_id;
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

  const canReview = request.status === "closed" && (isOwner || isHelper);
  let alreadyReviewed = false;
  if (user && canReview) {
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("request_id", id)
      .eq("reviewer_id", user.id)
      .maybeSingle();
    alreadyReviewed = Boolean(existingReview);
  }
  const revieweeId = isOwner ? request.helper_id : request.user_id;

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
        <div className="flex shrink-0 gap-2">
          {request.status === "closed" && (
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
              Abgeschlossen
            </span>
          )}
          {request.is_urgent && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              Dringend
            </span>
          )}
        </div>
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {r.profiles?.full_name ?? "Ein Nutzer"}
                      </p>
                      {request.helper_id === r.responder_id && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          ✓ Hat geholfen
                        </span>
                      )}
                    </div>
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

            {request.status === "open" && (
              <div className="mt-6 rounded-xl bg-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Anfrage als erledigt markieren
                </h3>
                <form
                  action={closeRequest}
                  className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <input type="hidden" name="requestId" value={id} />
                  <label className="flex flex-1 flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500">
                      Wer hat geholfen? (optional)
                    </span>
                    <select
                      name="helperId"
                      defaultValue=""
                      className={ratingSelectClass}
                    >
                      <option value="">Niemand ausgewählt</option>
                      {responses.map((r) => (
                        <option key={r.responder_id} value={r.responder_id}>
                          {r.profiles?.full_name ?? "Ein Nutzer"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="h-10 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Abschließen
                  </button>
                </form>
              </div>
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

        {canReview && revieweeId && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            {alreadyReviewed ? (
              <p className="text-sm text-slate-500">
                {bewertet === "1" && "Danke für deine Bewertung! "}
                Du hast diese Vermittlung bereits bewertet.
              </p>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  Wie war's?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Bewerte {isOwner ? "die Person, die dir geholfen hat" : "den Ersteller der Anfrage"}.
                </p>
                <form
                  action={submitReview}
                  className="mt-4 flex flex-col gap-4"
                >
                  <input type="hidden" name="requestId" value={id} />
                  <input type="hidden" name="revieweeId" value={revieweeId} />

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      Gesamtbewertung
                    </span>
                    <select
                      name="rating"
                      required
                      defaultValue=""
                      className={ratingSelectClass}
                    >
                      <option value="" disabled>
                        Bitte wählen
                      </option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {"⭐".repeat(n)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <RatingField name="reliability" label="Zuverlässigkeit" />
                    <RatingField name="friendliness" label="Freundlichkeit" />
                    <RatingField name="quality" label="Qualität" />
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      Kommentar (optional)
                    </span>
                    <textarea
                      name="comment"
                      rows={2}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </label>

                  <button
                    type="submit"
                    className="h-11 self-start rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Bewertung abschicken
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
