import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function MobileNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = user
    ? [
        { href: "/", label: "Start", icon: "🏠" },
        { href: "/entdecken", label: "Aufträge", icon: "🔍" },
        { href: "/anfrage/neu", label: "Neu", icon: "➕" },
        { href: "/nachrichten", label: "Chat", icon: "💬" },
        { href: `/profil/${user.id}`, label: "Profil", icon: "👤" },
      ]
    : [
        { href: "/", label: "Start", icon: "🏠" },
        { href: "/entdecken", label: "Aufträge", icon: "🔍" },
        { href: "/anfrage/neu", label: "Neu", icon: "➕" },
        { href: "/login", label: "Login", icon: "🔑" },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-slate-600 hover:text-brand"
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
