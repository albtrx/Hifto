import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";

type Conversation = {
  requestId: string;
  requestTitle: string;
  providerId: string;
  otherPartyLabel: string;
  preview: string;
  lastAt: string;
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/nachrichten");

  const [{ data: asProvider }, { data: asOwner }] = await Promise.all([
    supabase
      .from("offers")
      .select("message, created_at, request_id, provider_id, requests(title)")
      .eq("provider_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("requests")
      .select(
        "id, title, offers(message, created_at, provider_id, status, profiles(full_name))",
      )
      .eq("user_id", user.id),
  ]);

  const conversations: Conversation[] = [];

  for (const o of asProvider ?? []) {
    conversations.push({
      requestId: o.request_id,
      requestTitle: (o.requests as unknown as { title: string } | null)?.title ?? "",
      providerId: o.provider_id,
      otherPartyLabel: "Kunde",
      preview: o.message,
      lastAt: o.created_at,
    });
  }

  for (const req of asOwner ?? []) {
    for (const offer of (req.offers as unknown as {
      message: string;
      created_at: string;
      provider_id: string;
      status: string;
      profiles: { full_name: string | null } | null;
    }[]) ?? []) {
      if (offer.status !== "accepted") continue;
      conversations.push({
        requestId: req.id,
        requestTitle: req.title,
        providerId: offer.provider_id,
        otherPartyLabel: offer.profiles?.full_name ?? "Ein Anbieter",
        preview: offer.message,
        lastAt: offer.created_at,
      });
    }
  }

  conversations.sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Nachrichten
      </h1>

      {conversations.length === 0 ? (
        <p className="mt-6 text-slate-500">
          Noch keine Unterhaltungen. Sobald ein Angebot angenommen wurde,
          erscheint die Unterhaltung hier.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {conversations.map((c) => (
            <li key={`${c.requestId}-${c.providerId}`}>
              <Link
                href={`/nachrichten/${c.requestId}/${c.providerId}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {c.requestTitle}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatRelativeTime(c.lastAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {c.otherPartyLabel}
                </p>
                <p className="mt-2 line-clamp-1 text-sm text-slate-600">
                  {c.preview}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
