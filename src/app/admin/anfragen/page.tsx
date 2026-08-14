import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { setRequestHidden, deleteRequestAdmin } from "../actions";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, category, status, is_hidden, created_at")
    .order("created_at", { ascending: false });

  const list = requests ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        Anfragen ({list.length})
      </h2>

      <div className="mt-4 flex flex-col gap-2">
        {list.map((r) => {
          const category = categories.find((c) => c.slug === r.category);
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <Link
                href={`/anfrage/${r.id}`}
                className="flex-1 truncate text-sm font-medium text-slate-900 hover:text-brand"
              >
                {category?.emoji} {r.title}
              </Link>
              <span className="shrink-0 text-xs text-slate-400">
                {r.status}
                {r.is_hidden ? " · verborgen" : ""}
              </span>
              <form action={setRequestHidden}>
                <input type="hidden" name="requestId" value={r.id} />
                <input
                  type="hidden"
                  name="hidden"
                  value={r.is_hidden ? "0" : "1"}
                />
                <button
                  type="submit"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  {r.is_hidden ? "Einblenden" : "Verbergen"}
                </button>
              </form>
              <form action={deleteRequestAdmin}>
                <input type="hidden" name="requestId" value={r.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Löschen
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
