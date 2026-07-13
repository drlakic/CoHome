import type { Database } from "@/lib/supabase/database.types";
import type { InterestInput, ScoringInput } from "./types";

type LifestyleRow = Database["public"]["Tables"]["profile_lifestyle"]["Row"];
type KidsRow = Database["public"]["Tables"]["profile_kids_custody"]["Row"];

export function toScoringInput(
  lifestyle: LifestyleRow | null,
  kids: KidsRow | null,
  interests: InterestInput[],
): ScoringInput {
  return {
    lifestyle: lifestyle
      ? {
          pets: lifestyle.pets,
          smoking: lifestyle.smoking,
          cleanliness_level: lifestyle.cleanliness_level,
          schedule_type: lifestyle.schedule_type,
          noise_tolerance: lifestyle.noise_tolerance,
          overnight_guests_frequency: lifestyle.overnight_guests_frequency,
          overnight_guests_notice: lifestyle.overnight_guests_notice,
          dating_while_cohabiting_preference:
            lifestyle.dating_while_cohabiting_preference,
          hosting_frequency: lifestyle.hosting_frequency,
        }
      : null,
    kids: kids
      ? {
          has_kids: kids.has_kids,
          custody_arrangement: kids.custody_arrangement,
          roommate_kids_preference: kids.roommate_kids_preference,
        }
      : null,
    interests,
  };
}
