import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { unblockUser } from "../[id]/actions";

export default async function BlockedUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profil/blockiert");

  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id, profiles!blocks_blocked_id_fkey(id, full_name)")
    .eq("blocker_id", user.id);

  const list =
    (blocks as unknown as {
      blocked_id: string;
      profiles: { id: string; full_name: string | null } | null;
    }[]) ?? [];

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Blockierte Nutzer
      </h1>

      {list.length === 0 ? (
        <p className="mt-6 text-slate-500">Du hast niemanden blockiert.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((b) => (
            <li
              key={b.blocked_id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <Link
                href={`/profil/${b.blocked_id}`}
                className="text-sm font-medium text-slate-900 hover:text-brand"
              >
                {b.profiles?.full_name ?? "Ein Nutzer"}
              </Link>
              <form action={unblockUser}>
                <input type="hidden" name="userId" value={b.blocked_id} />
                <button
                  type="submit"
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Entblocken
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
