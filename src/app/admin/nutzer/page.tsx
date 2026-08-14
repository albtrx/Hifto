import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { setUserBanned } from "../actions";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, city, is_admin, is_banned, created_at")
    .order("created_at", { ascending: false });

  const list = users ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        Nutzer ({list.length})
      </h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Stadt</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="py-2 pr-4">
                  <Link href={`/profil/${u.id}`} className="hover:text-brand">
                    {u.full_name ?? "Unbenannt"}
                  </Link>
                  {u.is_admin && (
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                      Admin
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">{u.city ?? "–"}</td>
                <td className="py-2 pr-4">
                  {u.is_banned ? (
                    <span className="text-red-600">Gesperrt</span>
                  ) : (
                    <span className="text-green-600">Aktiv</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  {!u.is_admin && (
                    <form action={setUserBanned}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="hidden"
                        name="banned"
                        value={u.is_banned ? "0" : "1"}
                      />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-brand hover:underline"
                      >
                        {u.is_banned ? "Entsperren" : "Sperren"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
