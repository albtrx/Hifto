import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Need<span className="text-brand">It</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/entdecken"
            className="text-sm font-medium text-slate-600 hover:text-brand"
          >
            Entdecken
          </Link>
          <span className="text-sm font-medium text-slate-600">
            Wie es funktioniert
          </span>
          {user && (
            <Link
              href="/nachrichten"
              className="text-sm font-medium text-slate-600 hover:text-brand"
            >
              Nachrichten
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={`/profil/${user.id}`}
                className="hidden text-sm font-medium text-slate-600 hover:text-brand sm:inline"
              >
                Profil
              </Link>
              <form action={logout}>
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
              className="hidden text-sm font-medium text-slate-600 hover:text-brand sm:inline"
            >
              Einloggen
            </Link>
          )}
          <Link
            href="/anfrage/neu"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Anfrage erstellen
          </Link>
        </div>
      </div>
    </header>
  );
}
