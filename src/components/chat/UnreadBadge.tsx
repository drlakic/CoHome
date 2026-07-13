"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const MESSAGES_READ_EVENT = "cohome:messages-read";

export function UnreadBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("unread_message_count");
    if (typeof data === "number") setCount(data);
  }, []);

  // Route changes and "thread marked read" events both re-sync the count.
  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      // No filter: RLS scopes delivery to messages in my own conversations.
      channel = supabase
        .channel(`unread-badge-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => refetch(),
        )
        .subscribe();
    })();

    const onRead = () => refetch();
    window.addEventListener(MESSAGES_READ_EVENT, onRead);
    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener(MESSAGES_READ_EVENT, onRead);
    };
  }, [refetch]);

  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} unread message${count > 1 ? "s" : ""}`}
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 text-xs font-semibold text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
