"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MESSAGES_READ_EVENT } from "@/components/chat/UnreadBadge";
import type { ProfilePhoto } from "@/lib/supabase/database.types";

export interface ConversationRow {
  matchId: string;
  otherName: string;
  otherAge: number;
  photo: ProfilePhoto | null;
  preview: string | null; // last message body, null = no messages yet
  previewMine: boolean; // last message was sent by the viewer
  unread: number;
}

interface IncomingMessage {
  match_id: string;
  sender_id: string;
  body: string;
}

export function ConversationList({
  initialRows,
  meId,
}: {
  initialRows: ConversationRow[];
  meId: string;
}) {
  const [rows, setRows] = useState<ConversationRow[]>(initialRows);

  const refetchCounts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("unread_counts_by_match");
    if (!data) return;
    const byMatch = new Map(data.map((r) => [r.match_id, r.unread_count]));
    setRows((prev) =>
      prev.map((row) => ({ ...row, unread: byMatch.get(row.matchId) ?? 0 })),
    );
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      // One subscription for the whole list. No filter: RLS scopes delivery
      // to messages in the viewer's own conversations.
      channel = supabase
        .channel(`conversation-list-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as IncomingMessage;
            // Preview updates straight from the event; the count re-syncs
            // from the database (authoritative, respects read markers).
            setRows((prev) => {
              const idx = prev.findIndex((r) => r.matchId === msg.match_id);
              if (idx === -1) return prev;
              const updated = {
                ...prev[idx],
                preview: msg.body,
                previewMine: msg.sender_id === meId,
              };
              // Move the freshest conversation to the top.
              return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
            });
            refetchCounts();
          },
        )
        .subscribe();
    })();

    const onRead = () => refetchCounts();
    window.addEventListener(MESSAGES_READ_EVENT, onRead);
    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener(MESSAGES_READ_EVENT, onRead);
    };
  }, [meId, refetchCounts]);

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.matchId}>
          <Link
            href={`/matches/${row.matchId}`}
            className="flex items-center gap-4 rounded-2xl bg-linen p-4 ring-1 ring-mist/60 transition-shadow hover:shadow-md"
          >
            {row.photo ? (
              <Image
                src={row.photo.url}
                alt={`${row.otherName}'s photo`}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-full object-cover"
                style={{
                  objectPosition: `${row.photo.pos_x}% ${row.photo.pos_y}%`,
                }}
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand font-heading text-xl text-stone">
                {row.otherName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {row.otherName}, {row.otherAge}
              </p>
              <p
                className={`truncate text-sm ${
                  row.unread > 0 ? "font-medium text-charcoal" : "text-stone"
                }`}
              >
                {row.preview
                  ? `${row.previewMine ? "You: " : ""}${row.preview}`
                  : "Say hello — no messages yet"}
              </p>
            </div>
            {row.unread > 0 && (
              <span
                aria-label={`${row.unread} unread message${row.unread > 1 ? "s" : ""} from ${row.otherName}`}
                className="inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full bg-terracotta px-2 text-xs font-semibold text-white"
              >
                {row.unread > 99 ? "99+" : row.unread}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
