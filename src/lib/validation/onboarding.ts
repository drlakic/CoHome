import { z } from "zod";

// Members must be 30 or older. Computed against birthdate at validation time.
const MIN_AGE = 30;
const MAX_AGE = 110;

export const basicInfoSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  birthdate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Please enter a valid date")
    .refine((s) => {
      const dob = new Date(s);
      const now = new Date();
      const age =
        now.getFullYear() -
        dob.getFullYear() -
        (now.getMonth() < dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
          ? 1
          : 0);
      return age >= MIN_AGE && age <= MAX_AGE;
    }, `CoHome is for adults ${MIN_AGE} and older`),
  gender: z.string().trim().max(50).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  relationship_status: z.enum(["divorced", "widowed", "never_married", "other"]),
});

export const locationSchema = z
  .object({
    city_id: z.uuid("Please choose a city"),
    neighborhood_ids: z.array(z.uuid()).max(30).default([]),
    budget_min: z.coerce.number().int().min(0).max(100000),
    budget_max: z.coerce.number().int().min(0).max(100000),
    move_in_timeframe: z.enum([
      "immediate",
      "within_1_month",
      "within_3_months",
      "flexible",
    ]),
  })
  .refine((v) => v.budget_max >= v.budget_min, {
    message: "The top of your budget range needs to be at least the bottom",
    path: ["budget_max"],
  });

export const interestsSchema = z.object({
  interest_ids: z
    .array(z.uuid())
    .min(1, "Pick at least one interest so people know what you enjoy")
    .max(30, "Up to 30 interests"),
});

export const kidsSchema = z
  .object({
    has_kids: z.boolean(),
    num_kids: z.coerce.number().int().min(1).max(20).optional(),
    kid_ages: z.array(z.coerce.number().int().min(0).max(30)).max(20).default([]),
    custody_arrangement: z
      .enum(["full_time", "shared", "occasional", "none"])
      .optional(),
    typical_schedule: z.string().trim().max(1000).optional().or(z.literal("")),
    roommate_kids_preference: z.enum([
      "comfortable",
      "prefer_no_kids",
      "no_preference",
    ]),
  })
  .refine((v) => !v.has_kids || v.custody_arrangement != null, {
    message: "Please choose a custody arrangement",
    path: ["custody_arrangement"],
  });

export const lifestyleSchema = z.object({
  pets: z.enum(["has_pets", "okay_with_pets", "no_pets"]),
  smoking: z.enum(["yes", "no", "outside_only"]),
  cleanliness_level: z.coerce.number().int().min(1).max(5),
  schedule_type: z.enum(["early_riser", "night_owl", "flexible"]),
  noise_tolerance: z.coerce.number().int().min(1).max(5),
  overnight_guests_frequency: z.enum(["never", "occasionally", "regularly"]),
  overnight_guests_notice: z.enum([
    "no_notice_needed",
    "some_notice",
    "advance_notice_required",
  ]),
  dating_while_cohabiting_preference: z.enum([
    "comfortable",
    "prefer_discreet",
    "prefer_not_dating",
  ]),
  hosting_frequency: z.enum(["never", "small_only", "regularly"]),
  shared_space_guest_policy: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type InterestsInput = z.infer<typeof interestsSchema>;
export type KidsInput = z.infer<typeof kidsSchema>;
export type LifestyleInput = z.infer<typeof lifestyleSchema>;
