import { categories } from "@/lib/categories";
import { formatBudget, formatNeededAt, formatRelativeTime } from "@/lib/format";

export type RequestListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  needed_at: string | null;
  budget_amount: number | null;
  budget_currency: string;
  is_urgent: boolean;
  created_at: string;
};

export function RequestCard({ request }: { request: RequestListItem }) {
  const category = categories.find((c) => c.slug === request.category);
  const budget = formatBudget(request.budget_amount, request.budget_currency);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {category?.emoji} {request.title}
        </h3>
        {request.is_urgent && (
          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Dringend
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-slate-600">
        {request.description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
        <span>📍 {request.location}</span>
        <span>🕐 {formatNeededAt(request.needed_at)}</span>
        {budget && <span>💰 {budget}</span>}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400">
          {formatRelativeTime(request.created_at)}
        </span>
        <button
          type="button"
          disabled
          title="Kommt in Phase 7"
          className="cursor-not-allowed rounded-full bg-brand/40 px-4 py-2 text-sm font-semibold text-white"
        >
          Ich kann helfen
        </button>
      </div>
    </div>
  );
}
