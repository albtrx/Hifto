import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function isRateLimited(
  supabase: SupabaseServerClient,
  table: string,
  column: string,
  userId: string,
  limit: number,
  windowHours = 24,
): Promise<boolean> {
  const since = new Date(
    Date.now() - windowHours * 60 * 60 * 1000,
  ).toISOString();

  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, userId)
    .gte("created_at", since);

  return (count ?? 0) >= limit;
}
