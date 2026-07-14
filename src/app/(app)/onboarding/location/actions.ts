"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { locationSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";

export async function saveLocation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = locationSchema.safeParse({
    city_id: formData.get("city_id"),
    neighborhood_ids: formData.getAll("neighborhood_ids"),
    budget_min: formData.get("budget_min"),
    budget_max: formData.get("budget_max"),
    move_in_timeframe: formData.get("move_in_timeframe"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      city_id: parsed.data.city_id,
      budget_min: parsed.data.budget_min,
      budget_max: parsed.data.budget_max,
      move_in_timeframe: parsed.data.move_in_timeframe,
    })
    .eq("id", user.id);

  if (profileError) {
    return { message: "We couldn't save that — please try again" };
  }

  // Replace neighborhood preferences wholesale.
  await supabase
    .from("profile_neighborhood_preferences")
    .delete()
    .eq("profile_id", user.id);

  if (parsed.data.neighborhood_ids.length > 0) {
    const { error: prefError } = await supabase
      .from("profile_neighborhood_preferences")
      .insert(
        parsed.data.neighborhood_ids.map((neighborhood_id) => ({
          profile_id: user.id,
          neighborhood_id,
        })),
      );
    if (prefError) {
      return { message: "We couldn't save your neighborhoods — please try again" };
    }
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/onboarding", "layout");
  // Editing an already-completed profile stays on this step with a
  // confirmation; first-run onboarding continues to the next step.
  if (existingProfile?.onboarding_completed_at != null) {
    return { success: "Saved" };
  }
  redirect("/onboarding/interests");
}
