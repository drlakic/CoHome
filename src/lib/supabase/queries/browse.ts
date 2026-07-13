import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MatchStatus } from "@/lib/supabase/database.types";
import { scoreCompatibility } from "@/lib/matching/score";
import type { CompatibilityScore } from "@/lib/matching/types";
import { toScoringInput } from "@/lib/matching/from-db";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LifestyleRow = Database["public"]["Tables"]["profile_lifestyle"]["Row"];
type KidsRow = Database["public"]["Tables"]["profile_kids_custody"]["Row"];

export interface ProfileBundle {
  profile: Pick<
    ProfileRow,
    | "id"
    | "name"
    | "birthdate"
    | "gender"
    | "bio"
    | "relationship_status"
    | "photo_urls"
    | "city_id"
    | "budget_min"
    | "budget_max"
    | "move_in_timeframe"
    | "phone_verified"
    | "id_verified"
  >;
  lifestyle: LifestyleRow | null;
  kids: KidsRow | null;
  interests: { id: string; category: string }[];
  neighborhoodIds: string[];
}

const BUNDLE_SELECT = `id, name, birthdate, gender, bio, relationship_status, photo_urls,
  city_id, budget_min, budget_max, move_in_timeframe, phone_verified, id_verified,
  profile_lifestyle(*), profile_kids_custody(*), profile_interests(interest_id, interests(category)),
  profile_neighborhood_preferences(neighborhood_id)`;

interface RawBundleRow {
  id: string;
  name: string;
  birthdate: string;
  gender: string | null;
  bio: string | null;
  relationship_status: ProfileRow["relationship_status"];
  photo_urls: string[];
  city_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_timeframe: ProfileRow["move_in_timeframe"];
  phone_verified: boolean;
  id_verified: boolean;
  profile_lifestyle: LifestyleRow | null;
  profile_kids_custody: KidsRow | null;
  profile_interests: {
    interest_id: string;
    interests: { category: string } | null;
  }[];
  profile_neighborhood_preferences: { neighborhood_id: string }[];
}

function toBundle(row: RawBundleRow): ProfileBundle {
  const {
    profile_lifestyle,
    profile_kids_custody,
    profile_interests,
    profile_neighborhood_preferences,
    ...profile
  } = row;
  return {
    profile,
    lifestyle: profile_lifestyle,
    kids: profile_kids_custody,
    interests: profile_interests.map((i) => ({
      id: i.interest_id,
      category: i.interests?.category ?? "other",
    })),
    neighborhoodIds: profile_neighborhood_preferences.map(
      (n) => n.neighborhood_id,
    ),
  };
}

export async function fetchProfileBundle(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<ProfileBundle | null> {
  const { data } = await supabase
    .from("profiles")
    .select(BUNDLE_SELECT)
    .eq("id", profileId)
    .maybeSingle();
  if (!data) return null;
  return toBundle(data as unknown as RawBundleRow);
}

export interface ScoredCandidate {
  bundle: ProfileBundle;
  score: CompatibilityScore;
}

export interface BrowseFilters {
  cityIds?: string[]; // narrow to specific cities within the metro
  neighborhoodIds?: string[]; // candidates open to at least one of these
}

// Candidates: completed profiles anywhere in the viewer's metro area (the
// whole region matches by default; filters narrow it), excluding the viewer
// and anyone with a mutual or declined connection. Blocked users are already
// invisible via RLS. Scored against the viewer and sorted best-first.
export async function fetchScoredCandidates(
  supabase: SupabaseClient<Database>,
  viewer: ProfileBundle,
  filters: BrowseFilters = {},
): Promise<ScoredCandidate[]> {
  if (!viewer.profile.city_id) return [];

  // Every city sharing the viewer's metro area is in scope.
  const { data: viewerCity } = await supabase
    .from("cities")
    .select("metro_area")
    .eq("id", viewer.profile.city_id)
    .single();
  if (!viewerCity) return [];

  const { data: metroCities } = await supabase
    .from("cities")
    .select("id")
    .eq("metro_area", viewerCity.metro_area)
    .eq("is_active", true);
  const metroCityIds = (metroCities ?? []).map((c) => c.id);

  // City filter can only narrow within the metro, never widen past it.
  const cityIds =
    filters.cityIds && filters.cityIds.length > 0
      ? metroCityIds.filter((id) => filters.cityIds!.includes(id))
      : metroCityIds;
  if (cityIds.length === 0) return [];

  const [candidatesRes, matchesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(BUNDLE_SELECT)
      .in("city_id", cityIds)
      .not("onboarding_completed_at", "is", null)
      .neq("id", viewer.profile.id),
    supabase
      .from("matches")
      .select("user_a, user_b, status")
      .or(`user_a.eq.${viewer.profile.id},user_b.eq.${viewer.profile.id}`),
  ]);

  const settledWith = new Set<string>();
  for (const m of matchesRes.data ?? []) {
    if ((m.status as MatchStatus) === "pending") continue;
    settledWith.add(m.user_a === viewer.profile.id ? m.user_b : m.user_a);
  }

  const viewerInput = toScoringInput(
    viewer.lifestyle,
    viewer.kids,
    viewer.interests,
  );

  const wantedHoods =
    filters.neighborhoodIds && filters.neighborhoodIds.length > 0
      ? new Set(filters.neighborhoodIds)
      : null;

  return ((candidatesRes.data ?? []) as unknown as RawBundleRow[])
    .filter((row) => !settledWith.has(row.id))
    .filter(
      (row) =>
        !wantedHoods ||
        row.profile_neighborhood_preferences.some((n) =>
          wantedHoods.has(n.neighborhood_id),
        ),
    )
    .map((row) => {
      const bundle = toBundle(row);
      const score = scoreCompatibility(
        viewerInput,
        toScoringInput(bundle.lifestyle, bundle.kids, bundle.interests),
      );
      return { bundle, score };
    })
    .sort((a, b) => b.score.total - a.score.total);
}
