import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";
import { sendMessage } from "./actions";

type TimelineItem = {
  id: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ requestId: string; responderId: string }>;
}) {
  const { requestId, responderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/nachrichten/${requestId}/${responderId}`)}`,
    );
  }

  const { data: request } = await supabase
    .from("requests")
    .select("id, title, user_id")
    .eq("id", requestId)
    .single();

  if (!request) notFound();

  const isOwner = user.id === request.user_id;
  const isResponder = user.id === responderId;

  if (!isOwner && !isResponder) notFound();

  const otherPartyId = isOwner ? responderId : request.user_id;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherPartyId)
    .single();
  const otherPartyLabel = otherProfile?.full_name ?? "Ein Nutzer";

  const { data: initialResponse } = await supabase
    .from("responses")
    .select("message, created_at, responder_id")
    .eq("request_id", requestId)
    .eq("responder_id", responderId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, created_at, sender_id")
    .eq("request_id", requestId)
    .eq("responder_id", responderId)
    .order("created_at", { ascending: true });

  const timeline: TimelineItem[] = [];

  if (initialResponse) {
    timeline.push({
      id: "initial",
      body: initialResponse.message,
      createdAt: initialResponse.created_at,
      isMine: initialResponse.responder_id === user.id,
    });
  }

  for (const m of messages ?? []) {
    timeline.push({
      id: m.id,
      body: m.body,
      createdAt: m.created_at,
      isMine: m.sender_id === user.id,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6">
      <Link
        href="/nachrichten"
        className="text-sm text-slate-500 hover:text-brand"
      >
        ← Alle Nachrichten
      </Link>

      <div className="mt-2">
        <h1 className="text-xl font-bold text-slate-900">
          {otherPartyLabel}
        </h1>
        <Link
          href={`/anfrage/${requestId}`}
          className="text-sm text-slate-500 hover:text-brand"
        >
          Zur Anfrage: {request.title}
        </Link>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {timeline.map((item) => (
          <div
            key={item.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              item.isMine
                ? "self-end bg-brand text-white"
                : "self-start bg-white text-slate-800 border border-slate-200"
            }`}
          >
            <p>{item.body}</p>
            <p
              className={`mt-1 text-xs ${item.isMine ? "text-white/70" : "text-slate-400"}`}
            >
              {formatRelativeTime(item.createdAt)}
            </p>
          </div>
        ))}
      </div>

      <form
        action={sendMessage}
        className="mt-6 flex items-end gap-3 border-t border-slate-200 pt-4"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="responderId" value={responderId} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Nachricht schreiben..."
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
