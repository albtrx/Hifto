import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getUnreadCounts(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const [{ count: messageCount }, { count: bellCount }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .eq("type", "new_message"),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .neq("type", "new_message"),
  ]);

  return {
    messageCount: messageCount ?? 0,
    bellCount: bellCount ?? 0,
  };
}
