export type Pets = "has_pets" | "okay_with_pets" | "no_pets";
export type Smoking = "yes" | "no" | "outside_only";
export type ScheduleType = "early_riser" | "night_owl" | "flexible";
export type OvernightGuestsFrequency = "never" | "occasionally" | "regularly";
export type OvernightGuestsNotice =
  | "no_notice_needed"
  | "some_notice"
  | "advance_notice_required";
export type DatingPreference =
  | "comfortable"
  | "prefer_discreet"
  | "prefer_not_dating";
export type HostingFrequency = "never" | "small_only" | "regularly";
export type CustodyArrangement = "full_time" | "shared" | "occasional" | "none";
export type RoommateKidsPreference =
  | "comfortable"
  | "prefer_no_kids"
  | "no_preference";

export interface LifestyleInput {
  pets: Pets | null;
  smoking: Smoking | null;
  cleanliness_level: number | null; // 1-5
  schedule_type: ScheduleType | null;
  noise_tolerance: number | null; // 1-5
  overnight_guests_frequency: OvernightGuestsFrequency | null;
  overnight_guests_notice: OvernightGuestsNotice | null;
  dating_while_cohabiting_preference: DatingPreference | null;
  hosting_frequency: HostingFrequency | null;
}

export interface KidsInput {
  has_kids: boolean;
  custody_arrangement: CustodyArrangement | null;
  roommate_kids_preference: RoommateKidsPreference | null;
}

export interface InterestInput {
  id: string;
  category: string;
}

export interface ScoringInput {
  lifestyle: LifestyleInput | null;
  kids: KidsInput | null;
  interests: InterestInput[];
}

export interface CompatibilityScore {
  total: number;
  lifestyle: number;
  kids: number;
  interests: number;
}
