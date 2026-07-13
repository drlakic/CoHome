"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lifestyleSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";
import { getOnboardingState } from "@/lib/onboarding/state";

export async function saveLifestyle(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = lifestyleSchema.safeParse({
    pets: formData.get("pets"),
    smoking: formData.get("smoking"),
    cleanliness_level: formData.get("cleanliness_level"),
    schedule_type: formData.get("schedule_type"),
    noise_tolerance: formData.get("noise_tolerance"),
    overnight_guests_frequency: formData.get("overnight_guests_frequency"),
    overnight_guests_notice: formData.get("overnight_guests_notice"),
    dating_while_cohabiting_preference: formData.get(
      "dating_while_cohabiting_preference",
    ),
    hosting_frequency: formData.get("hosting_frequency"),
    shared_space_guest_policy: formData.get("shared_space_guest_policy"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  const { error } = await supabase.from("profile_lifestyle").upsert({
    profile_id: user.id,
    ...parsed.data,
    shared_space_guest_policy: parsed.data.shared_space_guest_policy || null,
  });
  if (error) {
    return { message: "We couldn't save that — please try again" };
  }

  // Final step: confirm every section is answered, then open up browsing.
  const state = await getOnboardingState(supabase, user.id);
  if (state.firstIncomplete) {
    return {
      message:
        "One earlier section still needs answers — use the steps above to finish it",
    };
  }

  if (!state.onboardingCompletedAt) {
    const { error: completeError } = await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);
    if (completeError) {
      return { message: "We couldn't finish up — please try again" };
    }
  }

  revalidatePath("/onboarding", "layout");
  redirect("/browse");
}
