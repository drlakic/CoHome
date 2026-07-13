"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { kidsSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";

export async function saveKids(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hasKids = formData.get("has_kids") === "yes";
  const kidAges = String(formData.get("kid_ages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const parsed = kidsSchema.safeParse({
    has_kids: hasKids,
    num_kids: hasKids ? formData.get("num_kids") : undefined,
    kid_ages: hasKids ? kidAges : [],
    custody_arrangement: hasKids
      ? formData.get("custody_arrangement")
      : "none",
    typical_schedule: hasKids ? formData.get("typical_schedule") : "",
    roommate_kids_preference: formData.get("roommate_kids_preference"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  const { error } = await supabase.from("profile_kids_custody").upsert({
    profile_id: user.id,
    has_kids: parsed.data.has_kids,
    num_kids: parsed.data.has_kids ? (parsed.data.num_kids ?? null) : null,
    kid_ages: parsed.data.kid_ages,
    custody_arrangement: parsed.data.custody_arrangement ?? null,
    typical_schedule: parsed.data.typical_schedule || null,
    roommate_kids_preference: parsed.data.roommate_kids_preference,
  });

  if (error) {
    return { message: "We couldn't save that — please try again" };
  }

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/lifestyle");
}
