"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { interestsSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";

export async function saveInterests(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let ids: unknown = [];
  try {
    ids = JSON.parse(String(formData.get("interest_ids") ?? "[]"));
  } catch {
    ids = [];
  }

  const parsed = interestsSchema.safeParse({ interest_ids: ids });
  if (!parsed.success) return toFormState(parsed.error);

  // Only accept ids that exist in the curated catalog.
  const { data: valid, error: validError } = await supabase
    .from("interests")
    .select("id")
    .in("id", parsed.data.interest_ids);
  if (validError || !valid || valid.length === 0) {
    return { message: "We couldn't save those — please try again" };
  }

  // Replace the member's interests wholesale.
  await supabase.from("profile_interests").delete().eq("profile_id", user.id);
  const { error: insertError } = await supabase.from("profile_interests").insert(
    valid.map((row) => ({
      profile_id: user.id,
      interest_id: row.id,
    })),
  );
  if (insertError) {
    return { message: "We couldn't save those — please try again" };
  }

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/kids");
}
