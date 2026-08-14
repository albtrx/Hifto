import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin
        </h1>
        <nav className="flex gap-5 text-sm font-medium text-slate-600">
          <Link href="/admin/meldungen" className="hover:text-brand">
            Meldungen
          </Link>
          <Link href="/admin/anfragen" className="hover:text-brand">
            Anfragen
          </Link>
          <Link href="/admin/nutzer" className="hover:text-brand">
            Nutzer
          </Link>
        </nav>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
