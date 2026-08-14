import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";

type Conversation = {
  requestId: string;
  requestTitle: string;
  responderId: string;
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

  const [{ data: asResponder }, { data: asOwner }] = await Promise.all([
    supabase
      .from("responses")
      .select("message, created_at, request_id, responder_id, requests(title)")
      .eq("responder_id", user.id),
    supabase
      .from("requests")
      .select(
        "id, title, responses(message, created_at, responder_id, profiles(full_name))",
      )
      .eq("user_id", user.id),
  ]);

  const conversations: Conversation[] = [];

  for (const r of asResponder ?? []) {
    conversations.push({
      requestId: r.request_id,
      requestTitle: (r.requests as unknown as { title: string } | null)?.title ?? "",
      responderId: r.responder_id,
      otherPartyLabel: "Ersteller der Anfrage",
      preview: r.message,
      lastAt: r.created_at,
    });
  }

  for (const req of asOwner ?? []) {
    for (const resp of (req.responses as unknown as {
      message: string;
      created_at: string;
      responder_id: string;
      profiles: { full_name: string | null } | null;
    }[]) ?? []) {
      conversations.push({
        requestId: req.id,
        requestTitle: req.title,
        responderId: resp.responder_id,
        otherPartyLabel: resp.profiles?.full_name ?? "Ein Nutzer",
        preview: resp.message,
        lastAt: resp.created_at,
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
          Noch keine Unterhaltungen. Sobald jemand auf eine deiner Anfragen
          antwortet oder du selbst "Ich kann helfen" klickst, erscheint die
          Unterhaltung hier.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {conversations.map((c) => (
            <li key={`${c.requestId}-${c.responderId}`}>
              <Link
                href={`/nachrichten/${c.requestId}/${c.responderId}`}
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
