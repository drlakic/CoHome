"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, type SentMessage } from "@/app/(app)/(main)/matches/[matchId]/actions";
import { MESSAGES_READ_EVENT } from "@/components/chat/UnreadBadge";

export function ChatThread({
  matchId,
  meId,
  otherName,
  initialMessages,
}: {
  matchId: string;
  meId: string;
  otherName: string;
  initialMessages: SentMessage[];
}) {
  const [messages, setMessages] = useState<SentMessage[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function appendMessage(msg: SentMessage) {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
    );
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // The thread is on screen, so everything in it counts as read — on open
    // and again whenever a new message arrives while we're looking at it.
    async function markRead() {
      await supabase.from("match_reads").upsert({
        match_id: matchId,
        profile_id: meId,
        last_read_at: new Date().toISOString(),
      });
      window.dispatchEvent(new CustomEvent(MESSAGES_READ_EVENT));
    }

    (async () => {
      // Realtime respects RLS; it needs the user's token, not the anon key.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`match-${matchId}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            appendMessage(payload.new as SentMessage);
            markRead();
          },
        )
        .subscribe();

      markRead();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId, meId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl bg-linen p-4 ring-1 ring-mist/60">
        {messages.length === 0 && (
          <p className="py-8 text-center text-stone">
            This is the start of your conversation with {otherName}. A simple
            hello works well.
          </p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_id === meId;
          return (
            <div
              key={msg.id}
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                mine
                  ? "self-end rounded-br-md bg-sage text-white"
                  : "self-start rounded-bl-md bg-cream ring-1 ring-mist/60"
              }`}
            >
              <p className="whitespace-pre-line break-words">{msg.body}</p>
              <p
                className={`mt-0.5 text-xs ${mine ? "text-white/70" : "text-stone"}`}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-terracotta-dark">{error}</p>}

      <form
        ref={formRef}
        action={async (formData) => {
          setError(null);
          const body = String(formData.get("body") ?? "").trim();
          if (!body) return;
          formRef.current?.reset();
          const result = await sendMessage(matchId, formData);
          if (result.error) setError(result.error);
          if (result.message) appendMessage(result.message);
        }}
        className="flex items-end gap-3"
      >
        <textarea
          name="body"
          rows={2}
          maxLength={4000}
          required
          placeholder={`Write to ${otherName}…`}
          className="flex-1 resize-none rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none transition-colors focus:border-sage"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="rounded-full bg-sage px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-dark"
        >
          Send
        </button>
      </form>
    </div>
  );
}
