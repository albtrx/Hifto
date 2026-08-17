"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiveBadge({
  userId,
  kind,
  initialCount,
  className,
}: {
  userId: string;
  kind: "bell" | "message";
  initialCount: number;
  className: string;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();

    async function refetch() {
      let query = supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      query =
        kind === "message"
          ? query.eq("type", "new_message")
          : query.neq("type", "new_message");
      const { count: fresh } = await query;
      setCount(fresh ?? 0);
    }

    const channel = supabase
      .channel(`notif-${kind}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        refetch,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, kind]);

  if (count <= 0) return null;

  return (
    <span className={className}>
      {count}
    </span>
  );
}
