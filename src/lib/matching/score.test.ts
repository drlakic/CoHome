import { describe, expect, it } from "vitest";
import {
  interestScore,
  kidsScore,
  lifestyleScore,
  scoreCompatibility,
} from "./score";
import type { KidsInput, LifestyleInput, ScoringInput } from "./types";

const fullLifestyle: LifestyleInput = {
  pets: "no_pets",
  smoking: "no",
  cleanliness_level: 4,
  schedule_type: "early_riser",
  noise_tolerance: 2,
  overnight_guests_frequency: "occasionally",
  overnight_guests_notice: "some_notice",
  dating_while_cohabiting_preference: "prefer_discreet",
  hosting_frequency: "small_only",
};

const noKids: KidsInput = {
  has_kids: false,
  custody_arrangement: "none",
  roommate_kids_preference: "no_preference",
};

describe("lifestyleScore", () => {
  it("scores identical lifestyles as 100", () => {
    expect(lifestyleScore(fullLifestyle, fullLifestyle)).toBe(100);
  });

  it("scores hard conflicts as 0 per field (has_pets vs no_pets)", () => {
    const a = { ...fullLifestyle, pets: "has_pets" as const };
    const b = { ...fullLifestyle, pets: "no_pets" as const };
    // 8 fields at 100, pets at 0 -> 800/9
    expect(lifestyleScore(a, b)).toBeCloseTo(800 / 9, 5);
  });

  it("gives partial credit for adjacent ordinal values", () => {
    const a = { ...fullLifestyle, cleanliness_level: 3 };
    const b = { ...fullLifestyle, cleanliness_level: 4 };
    // 8 fields at 100, cleanliness at 75 -> 875/9
    expect(lifestyleScore(a, b)).toBeCloseTo(875 / 9, 5);
  });

  it("treats flexible schedule as broadly compatible", () => {
    const a = { ...fullLifestyle, schedule_type: "flexible" as const };
    const b = { ...fullLifestyle, schedule_type: "night_owl" as const };
    expect(lifestyleScore(a, b)).toBeCloseTo((800 + 85) / 9, 5);
  });

  it("is symmetric", () => {
    const a = { ...fullLifestyle, smoking: "outside_only" as const, noise_tolerance: 5 };
    expect(lifestyleScore(a, fullLifestyle)).toBe(
      lifestyleScore(fullLifestyle, a),
    );
  });

  it("scores a missing field as neutral 50, not 0", () => {
    const a = { ...fullLifestyle, pets: null };
    expect(lifestyleScore(a, fullLifestyle)).toBeCloseTo((800 + 50) / 9, 5);
  });

  it("returns neutral 50 when a whole section is missing", () => {
    expect(lifestyleScore(null, fullLifestyle)).toBe(50);
  });
});

describe("kidsScore", () => {
  it("scores no-kids pair with no preferences as 100", () => {
    expect(kidsScore(noKids, noKids)).toBe(100);
  });

  it("zeroes the preference component when one prefers no kids and the other has kids", () => {
    const parent: KidsInput = {
      has_kids: true,
      custody_arrangement: "shared",
      roommate_kids_preference: "comfortable",
    };
    const prefersNoKids: KidsInput = {
      ...noKids,
      roommate_kids_preference: "prefer_no_kids",
    };
    // one direction 0, other direction 100 -> 50
    expect(kidsScore(parent, prefersNoKids)).toBe(50);
  });

  it("blends custody rhythm only when both have kids", () => {
    const fullTime: KidsInput = {
      has_kids: true,
      custody_arrangement: "full_time",
      roommate_kids_preference: "comfortable",
    };
    const occasional: KidsInput = {
      has_kids: true,
      custody_arrangement: "occasional",
      roommate_kids_preference: "comfortable",
    };
    // preference 100 both ways; rhythm distance |3-1|/3 -> 33.33
    expect(kidsScore(fullTime, occasional)).toBeCloseTo(
      0.7 * 100 + 0.3 * (100 - (2 / 3) * 100),
      5,
    );
  });

  it("ignores custody rhythm when only one is a parent", () => {
    const parent: KidsInput = {
      has_kids: true,
      custody_arrangement: "full_time",
      roommate_kids_preference: "comfortable",
    };
    expect(kidsScore(parent, noKids)).toBe(100);
  });
});

describe("interestScore", () => {
  const tag = (id: string, category: string) => ({ id, category });

  it("scores identical sets as 100", () => {
    const a = [tag("cooking", "food_drink"), tag("hiking", "outdoors")];
    const b = [tag("hiking", "outdoors"), tag("cooking", "food_drink")];
    expect(interestScore(a, b)).toBe(100);
  });

  it("gives partial credit for different tags in the same category", () => {
    // No exact matches, but both sides are entirely same-category:
    // every interest earns 0.5 -> 50
    const a = [tag("cooking", "food_drink")];
    const b = [tag("baking", "food_drink")];
    expect(interestScore(a, b)).toBe(50);
  });

  it("gives no credit across categories", () => {
    const a = [tag("cooking", "food_drink")];
    const b = [tag("hiking", "outdoors")];
    expect(interestScore(a, b)).toBe(0);
  });

  it("blends exact, category, and no-credit tiers", () => {
    // A: cooking (exact match), jazz (no counterpart category)
    // B: cooking (exact match), baking (same category as cooking), hiking (none)
    // A-side: cooking=1, jazz=0 -> 1
    // B-side: cooking=1, baking=0.5 (A has food_drink), hiking=0 -> 1.5
    // total 2.5 / 5 interests = 50
    const a = [tag("cooking", "food_drink"), tag("jazz", "music")];
    const b = [
      tag("cooking", "food_drink"),
      tag("baking", "food_drink"),
      tag("hiking", "outdoors"),
    ];
    expect(interestScore(a, b)).toBeCloseTo(50, 5);
  });

  it("is symmetric", () => {
    const a = [tag("cooking", "food_drink"), tag("golf", "sports_fitness")];
    const b = [tag("baking", "food_drink"), tag("hiking", "outdoors")];
    expect(interestScore(a, b)).toBe(interestScore(b, a));
  });

  it("treats an empty set as neutral 50, not incompatible", () => {
    expect(interestScore([], [tag("cooking", "food_drink")])).toBe(50);
  });
});

describe("scoreCompatibility", () => {
  const person = (overrides: Partial<ScoringInput> = {}): ScoringInput => ({
    lifestyle: fullLifestyle,
    kids: noKids,
    interests: [
      { id: "hiking", category: "outdoors" },
      { id: "cooking", category: "food_drink" },
    ],
    ...overrides,
  });

  it("weights buckets 60/20/20", () => {
    const result = scoreCompatibility(
      person(),
      person({ interests: [{ id: "reading", category: "arts_culture" }] }),
    );
    // lifestyle 100, kids 100, interests 0 (no shared tag or category)
    expect(result.total).toBe(80);
    expect(result.lifestyle).toBe(100);
    expect(result.kids).toBe(100);
    expect(result.interests).toBe(0);
  });

  it("scores a perfect pair as 100", () => {
    expect(scoreCompatibility(person(), person()).total).toBe(100);
  });

  it("stays within 0-100 and is symmetric", () => {
    const a = person({
      lifestyle: { ...fullLifestyle, pets: "has_pets", smoking: "yes" },
      interests: [],
    });
    const b = person({
      lifestyle: { ...fullLifestyle, pets: "no_pets", smoking: "no" },
      kids: { ...noKids, roommate_kids_preference: "prefer_no_kids" },
    });
    const ab = scoreCompatibility(a, b);
    const ba = scoreCompatibility(b, a);
    expect(ab.total).toBe(ba.total);
    expect(ab.total).toBeGreaterThanOrEqual(0);
    expect(ab.total).toBeLessThanOrEqual(100);
  });

  it("handles a brand-new profile with nothing filled in", () => {
    const empty: ScoringInput = { lifestyle: null, kids: null, interests: [] };
    const result = scoreCompatibility(empty, person());
    expect(result.total).toBe(50);
  });
});
