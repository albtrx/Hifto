import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUnreadCounts } from "@/lib/notifications";
import { LiveBadge } from "@/components/live-badge";

export async function MobileNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let messageCount = 0;
  if (user) {
    ({ messageCount } = await getUnreadCounts(supabase, user.id));
  }

  const items = user
    ? [
        { href: "/", label: "Start", icon: "🏠", isChat: false },
        { href: "/entdecken", label: "Aufträge", icon: "🔍", isChat: false },
        { href: "/anfrage/neu", label: "Neu", icon: "➕", isChat: false },
        { href: "/nachrichten", label: "Chat", icon: "💬", isChat: true },
        { href: `/profil/${user.id}`, label: "Profil", icon: "👤", isChat: false },
      ]
    : [
        { href: "/", label: "Start", icon: "🏠", isChat: false },
        { href: "/entdecken", label: "Aufträge", icon: "🔍", isChat: false },
        { href: "/anfrage/neu", label: "Neu", icon: "➕", isChat: false },
        { href: "/login", label: "Login", icon: "🔑", isChat: false },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-slate-600 hover:text-brand"
        >
          <span className="relative text-lg leading-none">
            {item.icon}
            {item.isChat && user && (
              <LiveBadge
                userId={user.id}
                kind="message"
                initialCount={messageCount}
                className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              />
            )}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
