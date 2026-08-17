import { createClient } from "@/lib/supabase/server";

export async function ProviderBadge({
  providerId,
  name,
  isVerified,
}: {
  providerId: string;
  name: string;
  isVerified: boolean;
}) {
  const supabase = await createClient();
  const [{ data: reviews }, { count: completedJobs }] = await Promise.all([
    supabase.from("reviews").select("rating").eq("reviewee_id", providerId),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("helper_id", providerId)
      .eq("status", "closed"),
  ]);

  const reviewCount = reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="font-medium text-slate-900">{name}</span>
      {avgRating && (
        <span className="text-slate-600">⭐ {avgRating.toFixed(1)}</span>
      )}
      <span className="text-slate-500">
        · {completedJobs ?? 0} {completedJobs === 1 ? "Auftrag" : "Aufträge"}
      </span>
      {isVerified && (
        <span className="font-medium text-brand">✓ Verifiziert</span>
      )}
    </div>
  );
}
