"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format";

type TimelineItem = {
  id: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export function ChatWindow({
  initialMessages,
  requestId,
  providerId,
  userId,
}: {
  initialMessages: TimelineItem[];
  requestId: string;
  providerId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-${requestId}-${providerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            body: string;
            created_at: string;
            sender_id: string;
            provider_id: string;
          };

          if (row.provider_id !== providerId) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                body: row.body,
                createdAt: row.created_at,
                isMine: row.sender_id === userId,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, providerId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="mt-6 flex flex-1 flex-col gap-3">
      {messages.map((item) => (
        <div
          key={item.id}
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
            item.isMine
              ? "self-end bg-brand text-white"
              : "self-start border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <p>{item.body}</p>
          <p
            className={`mt-1 text-xs ${item.isMine ? "text-white/70" : "text-slate-400"}`}
          >
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
