import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getAge } from "@/lib/format/age";
import { ChatThread } from "@/components/chat/ChatThread";
import { PhotoImg } from "@/components/profile/PhotoImg";
import { ReportBlockMenu } from "@/components/profile/ReportBlockMenu";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // RLS already scopes this to participants; double-check mutual status.
  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle();
  if (!match || match.status !== "mutual") notFound();

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: other } = await supabase
    .from("profiles")
    .select("id, name, birthdate, photos")
    .eq("id", otherId)
    .maybeSingle();
  if (!other) notFound(); // blocked since matching

  const { data: messages } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, body, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <section className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/profile/${other.id}`}
          className="flex items-center gap-3"
        >
          {other.photos[0] ? (
            <PhotoImg
              photo={other.photos[0]}
              alt={`'s photo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand font-heading text-lg text-stone">
              {other.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-lg leading-tight">
              {other.name}, {getAge(other.birthdate)}
            </h1>
            <p className="text-sm text-stone">View profile</p>
          </div>
        </Link>
        <ReportBlockMenu
          profileId={other.id}
          profileName={other.name}
          matchId={match.id}
        />
      </div>

      <ChatThread
        matchId={match.id}
        meId={user.id}
        otherName={other.name}
        initialMessages={messages ?? []}
      />
    </section>
  );
}
