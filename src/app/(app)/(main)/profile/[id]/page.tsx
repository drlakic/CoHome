import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileBundle } from "@/lib/supabase/queries/browse";
import { scoreCompatibility } from "@/lib/matching/score";
import { toScoringInput } from "@/lib/matching/from-db";
import { getAge } from "@/lib/format/age";
import {
  custodyLabels,
  datingPreferenceLabels,
  guestFrequencyLabels,
  guestNoticeLabels,
  hostingLabels,
  kidsPreferenceLabels,
  moveInLabels,
  petsLabels,
  relationshipStatusLabels,
  scaleLabel,
  scheduleLabels,
  smokingLabels,
} from "@/lib/format/labels";
import { CompatibilityBadge } from "@/components/profile/CompatibilityBadge";
import { ReportBlockMenu } from "@/components/profile/ReportBlockMenu";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { expressInterest } from "./actions";

export default async function ProfileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reported?: string }>;
}) {
  const { id } = await params;
  const { reported } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (id === user.id) redirect("/browse");

  const [viewer, subject] = await Promise.all([
    fetchProfileBundle(supabase, user.id),
    fetchProfileBundle(supabase, id),
  ]);
  if (!viewer) redirect("/onboarding");
  if (!subject) notFound(); // hidden by RLS (blocked) or doesn't exist

  const score = scoreCompatibility(
    toScoringInput(viewer.lifestyle, viewer.kids, viewer.interests),
    toScoringInput(subject.lifestyle, subject.kids, subject.interests),
  );

  // Connection state between the two of us, if any.
  const [userA, userB] = user.id < id ? [user.id, id] : [id, user.id];
  const { data: match } = await supabase
    .from("matches")
    .select("id, status, user_a_interested, user_b_interested")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  const iAmA = user.id === userA;
  // One-sided interest is deliberately never shown to the other person —
  // only mutual interest is ever revealed.
  const iExpressed = match
    ? iAmA
      ? match.user_a_interested
      : match.user_b_interested
    : false;

  // Shared interests for display.
  const { data: subjectInterests } = await supabase
    .from("profile_interests")
    .select("interests(id, name)")
    .eq("profile_id", id);
  const interestNames = (subjectInterests ?? [])
    .map((row) => row.interests)
    .filter((i): i is { id: string; name: string } => i != null);
  const viewerInterestSet = new Set(viewer.interests.map((i) => i.id));

  const p = subject.profile;
  const ls = subject.lifestyle;
  const kids = subject.kids;

  const lifestyleFacts = ls
    ? [
        ls.pets && petsLabels[ls.pets],
        ls.smoking && smokingLabels[ls.smoking],
        ls.schedule_type && scheduleLabels[ls.schedule_type],
        scaleLabel(ls.cleanliness_level, "Lived-in", "Everything in its place"),
        scaleLabel(ls.noise_tolerance, "Likes quiet", "Easygoing about sound"),
        ls.overnight_guests_frequency &&
          `Overnight guests: ${guestFrequencyLabels[ls.overnight_guests_frequency].toLowerCase()}`,
        ls.overnight_guests_notice && guestNoticeLabels[ls.overnight_guests_notice],
        ls.dating_while_cohabiting_preference &&
          datingPreferenceLabels[ls.dating_while_cohabiting_preference],
        ls.hosting_frequency && `Hosting: ${hostingLabels[ls.hosting_frequency].toLowerCase()}`,
      ].filter((f): f is string => Boolean(f))
    : [];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8">
      {reported && (
        <div className="rounded-xl bg-sage-light px-4 py-3 text-sage-dark">
          Thank you — your report has been received and we'll look into it.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">
            {p.name}, {getAge(p.birthdate)}
          </h1>
          <p className="text-stone">
            {relationshipStatusLabels[p.relationship_status]}
            {p.gender ? ` · ${p.gender}` : ""}
            {p.move_in_timeframe ? ` · ${moveInLabels[p.move_in_timeframe]}` : ""}
          </p>
        </div>
        <ReportBlockMenu profileId={p.id} profileName={p.name} />
      </div>

      {p.photo_urls.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {p.photo_urls.map((url) => (
            <Image
              key={url}
              src={url}
              alt={`${p.name}'s photo`}
              width={280}
              height={280}
              unoptimized
              className="h-64 w-64 flex-shrink-0 rounded-2xl object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-linen p-6 ring-1 ring-mist/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">How your lives line up</h2>
          <CompatibilityBadge percent={score.total} size="lg" />
        </div>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Day-to-day living", value: score.lifestyle },
            { label: "Kids & family", value: score.kids },
            { label: "Shared interests", value: score.interests },
          ].map((bucket) => (
            <div key={bucket.label} className="rounded-xl bg-cream p-3">
              <dt className="text-sm text-stone">{bucket.label}</dt>
              <dd className="text-xl font-medium">{bucket.value}%</dd>
            </div>
          ))}
        </dl>
      </div>

      {p.bio && (
        <div>
          <h2 className="mb-2 text-lg">About {p.name}</h2>
          <p className="whitespace-pre-line">{p.bio}</p>
        </div>
      )}

      {lifestyleFacts.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg">Life at home</h2>
          <ul className="flex flex-wrap gap-2">
            {lifestyleFacts.map((fact) => (
              <li
                key={fact}
                className="rounded-full bg-linen px-4 py-1.5 text-sm ring-1 ring-mist/60"
              >
                {fact}
              </li>
            ))}
          </ul>
          {ls?.shared_space_guest_policy && (
            <p className="mt-3 text-stone">
              On guests and shared spaces: &ldquo;{ls.shared_space_guest_policy}&rdquo;
            </p>
          )}
        </div>
      )}

      {kids && (
        <div>
          <h2 className="mb-2 text-lg">Kids and family</h2>
          <ul className="flex flex-wrap gap-2">
            {[
              kids.has_kids
                ? `Parent of ${kids.num_kids ?? "children"}${
                    kids.kid_ages.length > 0 ? ` (ages ${kids.kid_ages.join(", ")})` : ""
                  }`
                : "No children",
              kids.has_kids && kids.custody_arrangement
                ? custodyLabels[kids.custody_arrangement]
                : null,
              kids.roommate_kids_preference
                ? kidsPreferenceLabels[kids.roommate_kids_preference]
                : null,
            ]
              .filter((f): f is string => Boolean(f))
              .map((fact) => (
                <li
                  key={fact}
                  className="rounded-full bg-linen px-4 py-1.5 text-sm ring-1 ring-mist/60"
                >
                  {fact}
                </li>
              ))}
          </ul>
          {kids.typical_schedule && (
            <p className="mt-3 text-stone">{kids.typical_schedule}</p>
          )}
        </div>
      )}

      {interestNames.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg">Interests</h2>
          <ul className="flex flex-wrap gap-2">
            {interestNames.map((interest) => {
              const shared = viewerInterestSet.has(interest.id);
              return (
                <li
                  key={interest.id}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    shared
                      ? "bg-sage-light font-medium text-sage-dark"
                      : "bg-linen ring-1 ring-mist/60"
                  }`}
                >
                  {interest.name}
                  {shared ? " · you too" : ""}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-linen p-6 text-center ring-1 ring-mist/60">
        {match?.status === "mutual" ? (
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium">
              You've both expressed interest — you can talk here whenever
              you're ready.
            </p>
            <Link
              href={`/matches/${match.id}`}
              className="rounded-full bg-terracotta px-6 py-2.5 font-medium text-white transition-colors hover:bg-terracotta-dark"
            >
              Start the conversation
            </Link>
          </div>
        ) : match?.status === "declined" ? (
          <p className="text-stone">This connection isn't available.</p>
        ) : iExpressed ? (
          <p className="text-stone">
            You've expressed interest. If {p.name} feels the same, you'll both
            be able to message each other here.
          </p>
        ) : (
          <form action={expressInterest} className="flex flex-col items-center gap-2">
            <input type="hidden" name="target_id" value={p.id} />
            <SubmitButton pendingLabel="One moment…">
              Express interest
            </SubmitButton>
            <p className="text-sm text-stone">
              {p.name} will only see this if they're interested too — no
              pressure on either side.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
