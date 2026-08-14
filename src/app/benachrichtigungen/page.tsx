import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";
import { markAllAsRead } from "./actions";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/benachrichtigungen");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, message, related_request_id, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = notifications ?? [];
  const hasUnread = list.some((n) => !n.is_read);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Benachrichtigungen
        </h1>
        {hasUnread && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Alle als gelesen markieren
            </button>
          </form>
        )}
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-slate-500">Noch keine Benachrichtigungen.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {list.map((n) => (
            <li key={n.id}>
              <Link
                href={
                  n.related_request_id ? `/anfrage/${n.related_request_id}` : "#"
                }
                className={`block rounded-xl border p-4 transition-colors ${
                  n.is_read
                    ? "border-slate-200 bg-white"
                    : "border-brand/30 bg-brand/5"
                }`}
              >
                <p className="text-sm text-slate-800">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatRelativeTime(n.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
