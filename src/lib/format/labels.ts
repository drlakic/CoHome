// User-facing labels for enum values. Practical, warm, never judgmental.

export const relationshipStatusLabels: Record<string, string> = {
  divorced: "Divorced",
  widowed: "Widowed",
  never_married: "Never married",
  other: "It's more complicated",
};

export const moveInLabels: Record<string, string> = {
  immediate: "Ready to move now",
  within_1_month: "Within a month",
  within_3_months: "Within three months",
  flexible: "Flexible on timing",
};

export const petsLabels: Record<string, string> = {
  has_pets: "Has a pet",
  okay_with_pets: "Happy to live with pets",
  no_pets: "Prefers a pet-free home",
};

export const smokingLabels: Record<string, string> = {
  yes: "Smokes",
  no: "Doesn't smoke",
  outside_only: "Smokes outside only",
};

export const scheduleLabels: Record<string, string> = {
  early_riser: "Early riser",
  night_owl: "Night owl",
  flexible: "Depends on the day",
};

export const guestFrequencyLabels: Record<string, string> = {
  never: "Rarely or never",
  occasionally: "Now and then",
  regularly: "Fairly often",
};

export const guestNoticeLabels: Record<string, string> = {
  no_notice_needed: "No heads-up needed",
  some_notice: "Likes a mention beforehand",
  advance_notice_required: "Prefers real notice",
};

export const datingPreferenceLabels: Record<string, string> = {
  comfortable: "Comfortable with a housemate who dates",
  prefer_discreet: "Prefers dating kept low-key at home",
  prefer_not_dating: "Prefers a housemate who isn't dating",
};

export const hostingLabels: Record<string, string> = {
  never: "Rarely hosts",
  small_only: "Small get-togethers",
  regularly: "Likes to host",
};

export const custodyLabels: Record<string, string> = {
  full_time: "Kids live with them full-time",
  shared: "Shared custody",
  occasional: "Occasional visits",
  none: "Kids don't stay over",
};

export const kidsPreferenceLabels: Record<string, string> = {
  comfortable: "Comfortable living with part-time kids",
  prefer_no_kids: "Prefers a kid-free home",
  no_preference: "No strong preference about kids",
};

export function scaleLabel(
  value: number | null | undefined,
  low: string,
  high: string,
): string | null {
  if (value == null) return null;
  const descriptions = [low, `Leans ${low.toLowerCase()}`, "In between", `Leans ${high.toLowerCase()}`, high];
  return descriptions[value - 1] ?? null;
}
