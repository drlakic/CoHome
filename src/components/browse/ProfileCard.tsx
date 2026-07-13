import Image from "next/image";
import Link from "next/link";
import { getAge } from "@/lib/format/age";
import { CompatibilityBadge } from "@/components/profile/CompatibilityBadge";
import type { ScoredCandidate } from "@/lib/supabase/queries/browse";

export function ProfileCard({ candidate }: { candidate: ScoredCandidate }) {
  const { profile } = candidate.bundle;
  const photo = profile.photo_urls[0];
  const snippet =
    profile.bio && profile.bio.length > 120
      ? `${profile.bio.slice(0, 120).trimEnd()}…`
      : profile.bio;

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="flex flex-col overflow-hidden rounded-2xl bg-linen shadow-sm ring-1 ring-mist/60 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-sand">
        {photo ? (
          <Image
            src={photo}
            alt={`${profile.name}'s photo`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-5xl text-stone/50">
            {profile.name.charAt(0)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <CompatibilityBadge percent={candidate.score.total} />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-lg">
          {profile.name}, {getAge(profile.birthdate)}
        </h3>
        {snippet && <p className="text-sm text-stone">{snippet}</p>}
      </div>
    </Link>
  );
}
