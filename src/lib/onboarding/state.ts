import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const ONBOARDING_STEPS = [
  { slug: "basic-info", label: "About you" },
  { slug: "location", label: "Where and when" },
  { slug: "interests", label: "What you enjoy" },
  { slug: "kids", label: "Kids and family" },
  { slug: "lifestyle", label: "Life at home" },
] as const;

export type OnboardingStepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

export interface OnboardingState {
  completed: Record<OnboardingStepSlug, boolean>;
  firstIncomplete: OnboardingStepSlug | null; // null = all steps done
  onboardingCompletedAt: string | null;
}

export async function getOnboardingState(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<OnboardingState> {
  const [profileRes, interestsRes, kidsRes, lifestyleRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, city_id, budget_min, move_in_timeframe, onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("profile_interests")
      .select("interest_id", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("profile_kids_custody")
      .select("profile_id")
      .eq("profile_id", userId)
      .maybeSingle(),
    supabase
      .from("profile_lifestyle")
      .select("profile_id")
      .eq("profile_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;

  const completed: Record<OnboardingStepSlug, boolean> = {
    "basic-info": profile != null,
    location:
      profile != null &&
      profile.city_id != null &&
      profile.budget_min != null &&
      profile.move_in_timeframe != null,
    interests: (interestsRes.count ?? 0) > 0,
    kids: kidsRes.data != null,
    lifestyle: lifestyleRes.data != null,
  };

  const firstIncomplete =
    ONBOARDING_STEPS.find((s) => !completed[s.slug])?.slug ?? null;

  return {
    completed,
    firstIncomplete,
    onboardingCompletedAt: profile?.onboarding_completed_at ?? null,
  };
}
