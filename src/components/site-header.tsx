import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const navItems = ["Entdecken", "Wie es funktioniert"];

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
          {navItems.map((item) => (
            <span key={item} className="text-sm font-medium text-slate-600">
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                {user.email}
              </span>
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
          <a
            href="#anfrage-erstellen"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Anfrage erstellen
          </a>
        </div>
      </div>
    </header>
  );
}
