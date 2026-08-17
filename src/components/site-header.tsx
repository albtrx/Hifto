import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { getUnreadCounts } from "@/lib/notifications";
import { LiveBadge } from "@/components/live-badge";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let bellCount = 0;
  let messageCount = 0;
  let isAdmin = false;
  if (user) {
    const [counts, { data: profile }] = await Promise.all([
      getUnreadCounts(supabase, user.id),
      supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
    ]);
    bellCount = counts.bellCount;
    messageCount = counts.messageCount;
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Hif<span className="text-brand">to</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/entdecken"
            className="text-sm font-medium text-slate-600 hover:text-brand"
          >
            Aufträge
          </Link>
          <span className="text-sm font-medium text-slate-600">
            Wie es funktioniert
          </span>
          {user && (
            <Link
              href="/nachrichten"
              className="relative text-sm font-medium text-slate-600 hover:text-brand"
            >
              Nachrichten
              <LiveBadge
                userId={user.id}
                kind="message"
                initialCount={messageCount}
                className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              />
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/benachrichtigungen"
                className="relative text-lg text-slate-600 hover:text-brand"
                aria-label="Benachrichtigungen"
              >
                🔔
                <LiveBadge
                  userId={user.id}
                  kind="bell"
                  initialCount={bellCount}
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                />
              </Link>
              <Link
                href={`/profil/${user.id}`}
                className="hidden text-sm font-medium text-slate-600 hover:text-brand lg:inline"
              >
                Profil
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden text-sm font-medium text-slate-600 hover:text-brand lg:inline"
                >
                  Admin
                </Link>
              )}
              <form action={logout} className="hidden lg:block">
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-600 hover:text-brand"
                >
                  Ausloggen
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-brand lg:inline"
            >
              Einloggen
            </Link>
          )}
          <Link
            href="/anfrage/neu"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark lg:inline-block"
          >
            Anfrage erstellen
          </Link>
        </div>
      </div>
    </header>
  );
}
