import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAge } from "@/lib/format/age";
import {
  ConversationList,
  type ConversationRow,
} from "@/components/chat/ConversationList";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b, updated_at")
    .eq("status", "mutual")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const mutual = matches ?? [];
  const otherIds = mutual.map((m) =>
    m.user_a === user.id ? m.user_b : m.user_a,
  );

  const [profilesRes, messagesRes, unreadRes] = await Promise.all([
    otherIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, name, birthdate, photo_urls")
          .in("id", otherIds)
      : Promise.resolve({ data: [] as never[] }),
    mutual.length > 0
      ? supabase
          .from("messages")
          .select("match_id, sender_id, body, created_at")
          .in("match_id", mutual.map((m) => m.id))
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] as never[] }),
    supabase.rpc("unread_counts_by_match"),
  ]);

  const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const lastMessageByMatch = new Map<
    string,
    { sender_id: string; body: string }
  >();
  for (const msg of messagesRes.data ?? []) {
    if (!lastMessageByMatch.has(msg.match_id)) {
      lastMessageByMatch.set(msg.match_id, msg);
    }
  }
  const unreadByMatch = new Map(
    (unreadRes.data ?? []).map((r) => [r.match_id, r.unread_count]),
  );

  const rows: ConversationRow[] = mutual.flatMap((m) => {
    const other = profileById.get(m.user_a === user.id ? m.user_b : m.user_a);
    if (!other) return []; // hidden by RLS (e.g. blocked)
    const last = lastMessageByMatch.get(m.id);
    return [
      {
        matchId: m.id,
        otherName: other.name,
        otherAge: getAge(other.birthdate),
        photoUrl: other.photo_urls[0] ?? null,
        preview: last?.body ?? null,
        previewMine: last?.sender_id === user.id,
        unread: unreadByMatch.get(m.id) ?? 0,
      },
    ];
  });

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl">Your connections</h1>
        <p className="text-stone">
          People you've both expressed interest in. Take your time getting to
          know each other.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-linen p-8 text-center ring-1 ring-mist/60">
          <p className="mb-1 font-medium">No connections yet</p>
          <p className="text-stone">
            When you and someone else both express interest, they'll appear
            here and you can start talking.
          </p>
        </div>
      ) : (
        <ConversationList initialRows={rows} meId={user.id} />
      )}
    </section>
  );
}
