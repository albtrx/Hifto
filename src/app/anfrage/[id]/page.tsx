import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { formatBudget, formatNeededAt, formatRelativeTime } from "@/lib/format";
import { ProviderBadge } from "@/components/provider-badge";
import { submitOffer, acceptOffer, closeRequest, submitReview } from "./actions";

type OfferRow = {
  id: string;
  price: number;
  availability: string;
  message: string;
  estimated_duration: string | null;
  status: string;
  created_at: string;
  provider_id: string;
  profiles: { full_name: string | null; is_verified: boolean } | null;
};

const ratingSelectClass =
  "h-10 rounded-lg border border-slate-300 px-2 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

const inputClass =
  "h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

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

  let myOffer: OfferRow | null = null;
  let offers: OfferRow[] = [];

  if (user && !isOwner) {
    const { data: existing } = await supabase
      .from("offers")
      .select(
        "id, price, availability, message, estimated_duration, status, created_at, provider_id, profiles(full_name, is_verified)",
      )
      .eq("request_id", id)
      .eq("provider_id", user.id)
      .maybeSingle();
    myOffer = (existing as unknown as OfferRow) ?? null;
  }

  if (isOwner) {
    const { data } = await supabase
      .from("offers")
      .select(
        "id, price, availability, message, estimated_duration, status, created_at, provider_id, profiles(full_name, is_verified)",
      )
      .eq("request_id", id)
      .order("created_at", { ascending: false });
    offers = (data as unknown as OfferRow[]) ?? [];
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

  let ownerName: string | null = null;
  if (!isOwner) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", request.user_id)
      .single();
    ownerName = ownerProfile?.full_name ?? null;
  }

  const statusLabel: Record<string, string> = {
    assigned: "Vergeben",
    closed: "Abgeschlossen",
  };

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
          {statusLabel[request.status] && (
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {statusLabel[request.status]}
            </span>
          )}
          {request.is_urgent && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              Dringend
            </span>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="mt-2 flex items-center gap-3 text-sm">
          <Link
            href={`/profil/${request.user_id}`}
            className="text-slate-500 hover:text-brand"
          >
            von {ownerName ?? "Ein Nutzer"}
          </Link>
          {user && (
            <Link
              href={`/melden?requestId=${id}`}
              className="text-slate-400 hover:text-red-600"
            >
              Melden
            </Link>
          )}
        </div>
      )}

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
              Angebote ({offers.length})
            </h2>
            {offers.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Noch keine Angebote eingegangen.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {offers.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <ProviderBadge
                        providerId={o.provider_id}
                        name={o.profiles?.full_name ?? "Ein Nutzer"}
                        isVerified={o.profiles?.is_verified ?? false}
                      />
                      <span className="shrink-0 text-lg font-bold text-slate-900">
                        {o.price} {request.budget_currency}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">{o.message}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>🕐 {o.availability}</span>
                      {o.estimated_duration && (
                        <span>⏱ {o.estimated_duration}</span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(o.created_at)}
                      </p>
                      <div className="flex items-center gap-3">
                        {o.status === "accepted" && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            ✓ Angenommen
                          </span>
                        )}
                        {o.status === "rejected" && (
                          <span className="text-xs text-slate-400">
                            Nicht ausgewählt
                          </span>
                        )}
                        {o.status === "accepted" && (
                          <Link
                            href={`/nachrichten/${id}/${o.provider_id}`}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Zum Chat
                          </Link>
                        )}
                        {request.status === "open" &&
                          o.status === "pending" && (
                            <form action={acceptOffer}>
                              <input
                                type="hidden"
                                name="requestId"
                                value={id}
                              />
                              <input
                                type="hidden"
                                name="offerId"
                                value={o.id}
                              />
                              <input
                                type="hidden"
                                name="providerId"
                                value={o.provider_id}
                              />
                              <button
                                type="submit"
                                className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                              >
                                Angebot annehmen
                              </button>
                            </form>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {request.status === "assigned" && (
              <div className="mt-6 rounded-xl bg-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Auftrag erledigt?
                </h3>
                <form action={closeRequest} className="mt-3">
                  <input type="hidden" name="requestId" value={id} />
                  <button
                    type="submit"
                    className="h-10 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Als abgeschlossen markieren
                  </button>
                </form>
              </div>
            )}
          </>
        ) : request.status !== "open" && !myOffer ? (
          <p className="text-sm text-slate-500">
            Dieser Auftrag ist bereits vergeben.
          </p>
        ) : myOffer ? (
          <div>
            {myOffer.status === "accepted" ? (
              <>
                <p className="text-sm text-green-700">
                  🎉 Dein Angebot wurde angenommen!
                </p>
                {user && (
                  <Link
                    href={`/nachrichten/${id}/${user.id}`}
                    className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                  >
                    Zum Chat →
                  </Link>
                )}
              </>
            ) : myOffer.status === "rejected" ? (
              <p className="text-sm text-slate-500">
                Der Kunde hat sich für einen anderen Anbieter entschieden.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {erfolg === "1" && "Dein Angebot wurde gesendet! "}
                Du wirst benachrichtigt, sobald sich der Kunde entscheidet.
              </p>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Angebot abgeben
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Sag dem Kunden, was du anbietest und was es kostet.
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
                Einloggen, um ein Angebot abzugeben
              </Link>
            ) : (
              <form action={submitOffer} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="requestId" value={id} />

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      Preis ({request.budget_currency})
                    </span>
                    <input
                      name="price"
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      placeholder="180"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      Verfügbarkeit
                    </span>
                    <input
                      name="availability"
                      type="text"
                      required
                      placeholder="Heute 18:00"
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Erwartete Dauer (optional)
                  </span>
                  <input
                    name="estimatedDuration"
                    type="text"
                    placeholder="ca. 1 Stunde"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Nachricht
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder="z. B. Ich kann heute vorbeikommen und das reparieren."
                    className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </label>

                <button
                  type="submit"
                  className="h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Angebot senden
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
                  Bewerte {isOwner ? "die Person, die dir geholfen hat" : "den Kunden"}.
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
