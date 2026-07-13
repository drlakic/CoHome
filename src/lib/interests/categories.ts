// Display order and labels for the curated interest categories.
// The category slugs must match the check constraint on public.interests.

export const INTEREST_CATEGORIES = [
  { slug: "food_drink", label: "Food & Drink" },
  { slug: "outdoors", label: "Outdoors & Nature" },
  { slug: "arts_culture", label: "Arts & Culture" },
  { slug: "music", label: "Music" },
  { slug: "home_hobbies", label: "Home & Hobbies" },
  { slug: "sports_fitness", label: "Sports & Fitness" },
  { slug: "community_learning", label: "Community & Learning" },
  { slug: "travel_leisure", label: "Travel & Leisure" },
] as const;

export type InterestCategorySlug =
  (typeof INTEREST_CATEGORIES)[number]["slug"];
