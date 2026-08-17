import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { RequestCard, type RequestListItem } from "@/components/request-card";

const selectClass =
  "h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

type SearchParams = {
  kategorie?: string;
  heute?: string;
  budget?: string;
  dringend?: string;
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { kategorie, heute, budget, dringend } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (kategorie) query = query.eq("category", kategorie);
  if (dringend === "1") query = query.eq("is_urgent", true);
  if (budget) query = query.lte("budget_amount", Number(budget));

  if (heute === "1") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    query = query
      .gte("needed_at", start.toISOString())
      .lt("needed_at", end.toISOString());
  }

  const { data: requests } = await query;
  let list = (requests ?? []) as RequestListItem[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: blocks } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    const blockedIds = new Set((blocks ?? []).map((b) => b.blocked_id));
    if (blockedIds.size > 0) {
      list = list.filter((r) => !blockedIds.has(r.user_id));
    }
  }
  const hasActiveFilters = Boolean(kategorie || heute || budget || dringend);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Aufträge in deiner Nähe
      </h1>
      <p className="mt-2 text-slate-600">
        Finde Kunden, die gerade Hilfe benötigen.{" "}
        {list.length} offene {list.length === 1 ? "Auftrag" : "Aufträge"}
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">
            Kategorie
          </span>
          <select
            name="kategorie"
            defaultValue={kategorie ?? ""}
            className={selectClass}
          >
            <option value="">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">
            Budget bis
          </span>
          <input
            name="budget"
            type="number"
            min={0}
            defaultValue={budget ?? ""}
            placeholder="z. B. 100"
            className={`${selectClass} w-28`}
          />
        </label>

        <label className="flex items-center gap-2 pb-2.5">
          <input
            type="checkbox"
            name="heute"
            value="1"
            defaultChecked={heute === "1"}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm text-slate-700">Nur heute</span>
        </label>

        <label className="flex items-center gap-2 pb-2.5">
          <input
            type="checkbox"
            name="dringend"
            value="1"
            defaultChecked={dringend === "1"}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm text-slate-700">Nur dringend</span>
        </label>

        <button
          type="submit"
          className="h-10 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Filtern
        </button>

        {hasActiveFilters && (
          <Link
            href="/entdecken"
            className="text-sm text-slate-500 hover:text-brand"
          >
            Zurücksetzen
          </Link>
        )}
      </form>

      {list.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-slate-500">
          Keine Anfragen gefunden.
          {hasActiveFilters && " Versuch es mit weniger Filtern."}
        </div>
      )}
    </div>
  );
}
