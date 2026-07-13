import type {
  CompatibilityScore,
  InterestInput,
  KidsInput,
  LifestyleInput,
  Pets,
  ScheduleType,
  ScoringInput,
  Smoking,
} from "./types";

// Bucket weights per spec: lifestyle mismatch is what actually breaks a
// shared home, so it dominates; interests are a bonus signal.
const LIFESTYLE_WEIGHT = 0.6;
const KIDS_WEIGHT = 0.2;
const INTERESTS_WEIGHT = 0.2;

// A missing answer (or a whole missing section) scores neutral rather than
// penalizing: absence of data is not evidence of incompatibility.
const NEUTRAL = 50;

function petsScore(a: Pets, b: Pets): number {
  if (a === b) return 100;
  const pair = new Set([a, b]);
  if (pair.has("has_pets") && pair.has("no_pets")) return 0;
  if (pair.has("has_pets") && pair.has("okay_with_pets")) return 100;
  // okay_with_pets + no_pets: livable, mild friction
  return 70;
}

function smokingScore(a: Smoking, b: Smoking): number {
  if (a === b) return 100;
  const pair = new Set([a, b]);
  if (pair.has("yes") && pair.has("no")) return 0;
  if (pair.has("yes") && pair.has("outside_only")) return 60;
  // outside_only + no
  return 50;
}

function scheduleScore(a: ScheduleType, b: ScheduleType): number {
  if (a === b) return 100;
  if (a === "flexible" || b === "flexible") return 85;
  // early_riser vs night_owl: different rhythms, not a dealbreaker
  return 55;
}

// Linear distance decay for ordinal fields: same = 100, opposite ends = 0.
function ordinalScore(a: number, b: number, maxDistance: number): number {
  return 100 - (Math.abs(a - b) / maxDistance) * 100;
}

const FREQUENCY_ORDER = { never: 0, occasionally: 1, regularly: 2 } as const;
const NOTICE_ORDER = {
  no_notice_needed: 0,
  some_notice: 1,
  advance_notice_required: 2,
} as const;
const DATING_ORDER = {
  comfortable: 0,
  prefer_discreet: 1,
  prefer_not_dating: 2,
} as const;
const HOSTING_ORDER = { never: 0, small_only: 1, regularly: 2 } as const;
const CUSTODY_ORDER = {
  none: 0,
  occasional: 1,
  shared: 2,
  full_time: 3,
} as const;

export function lifestyleScore(
  a: LifestyleInput | null,
  b: LifestyleInput | null,
): number {
  if (!a || !b) return NEUTRAL;

  const fieldScores: number[] = [];
  const add = <T,>(
    valA: T | null,
    valB: T | null,
    score: (x: T, y: T) => number,
  ) => {
    fieldScores.push(
      valA == null || valB == null ? NEUTRAL : score(valA, valB),
    );
  };

  add(a.pets, b.pets, petsScore);
  add(a.smoking, b.smoking, smokingScore);
  add(a.cleanliness_level, b.cleanliness_level, (x, y) =>
    ordinalScore(x, y, 4),
  );
  add(a.schedule_type, b.schedule_type, scheduleScore);
  add(a.noise_tolerance, b.noise_tolerance, (x, y) => ordinalScore(x, y, 4));
  add(a.overnight_guests_frequency, b.overnight_guests_frequency, (x, y) =>
    ordinalScore(FREQUENCY_ORDER[x], FREQUENCY_ORDER[y], 2),
  );
  add(a.overnight_guests_notice, b.overnight_guests_notice, (x, y) =>
    ordinalScore(NOTICE_ORDER[x], NOTICE_ORDER[y], 2),
  );
  add(
    a.dating_while_cohabiting_preference,
    b.dating_while_cohabiting_preference,
    (x, y) => ordinalScore(DATING_ORDER[x], DATING_ORDER[y], 2),
  );
  add(a.hosting_frequency, b.hosting_frequency, (x, y) =>
    ordinalScore(HOSTING_ORDER[x], HOSTING_ORDER[y], 2),
  );

  return fieldScores.reduce((sum, s) => sum + s, 0) / fieldScores.length;
}

export function kidsScore(a: KidsInput | null, b: KidsInput | null): number {
  if (!a || !b) return NEUTRAL;

  const prefMatch = (
    pref: KidsInput["roommate_kids_preference"],
    otherHasKids: boolean,
  ): number => {
    if (pref == null) return NEUTRAL;
    if (pref === "prefer_no_kids" && otherHasKids) return 0;
    return 100;
  };

  const preferenceComponent =
    (prefMatch(a.roommate_kids_preference, b.has_kids) +
      prefMatch(b.roommate_kids_preference, a.has_kids)) /
    2;

  // Custody rhythm (how much kid-presence each arrangement implies) is only
  // a meaningful comparison when both parties are parents.
  if (a.has_kids && b.has_kids && a.custody_arrangement && b.custody_arrangement) {
    const rhythm = ordinalScore(
      CUSTODY_ORDER[a.custody_arrangement],
      CUSTODY_ORDER[b.custody_arrangement],
      3,
    );
    return 0.7 * preferenceComponent + 0.3 * rhythm;
  }

  return preferenceComponent;
}

// Tiered overlap: an exact shared tag earns full credit, a different tag in
// the same category earns partial credit, anything else earns nothing.
// Each side's interests are matched to their best counterpart on the other
// side, and the two directions are averaged (soft Jaccard).
const SAME_CATEGORY_CREDIT = 0.5;

export function interestScore(
  a: InterestInput[],
  b: InterestInput[],
): number {
  if (a.length === 0 || b.length === 0) return NEUTRAL;

  const bestMatch = (
    interest: InterestInput,
    others: InterestInput[],
    otherIds: Set<string>,
  ): number => {
    if (otherIds.has(interest.id)) return 1;
    if (others.some((o) => o.category === interest.category)) {
      return SAME_CATEGORY_CREDIT;
    }
    return 0;
  };

  const aIds = new Set(a.map((i) => i.id));
  const bIds = new Set(b.map((i) => i.id));

  let total = 0;
  for (const interest of a) total += bestMatch(interest, b, bIds);
  for (const interest of b) total += bestMatch(interest, a, aIds);

  return (total / (a.length + b.length)) * 100;
}

export function scoreCompatibility(
  a: ScoringInput,
  b: ScoringInput,
): CompatibilityScore {
  const lifestyle = lifestyleScore(a.lifestyle, b.lifestyle);
  const kids = kidsScore(a.kids, b.kids);
  const interests = interestScore(a.interests, b.interests);

  const total = Math.round(
    LIFESTYLE_WEIGHT * lifestyle +
      KIDS_WEIGHT * kids +
      INTERESTS_WEIGHT * interests,
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    lifestyle: Math.round(lifestyle),
    kids: Math.round(kids),
    interests: Math.round(interests),
  };
}
