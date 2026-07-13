"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { basicInfoSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";

export async function saveBasicInfo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = basicInfoSchema.safeParse({
    name: formData.get("name"),
    birthdate: formData.get("birthdate"),
    gender: formData.get("gender"),
    bio: formData.get("bio"),
    relationship_status: formData.get("relationship_status"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  let photoUrls: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("photo_urls") ?? "[]"));
    if (Array.isArray(raw)) photoUrls = raw.filter((u) => typeof u === "string");
  } catch {
    photoUrls = [];
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: parsed.data.name,
    birthdate: parsed.data.birthdate,
    gender: parsed.data.gender || null,
    bio: parsed.data.bio || null,
    relationship_status: parsed.data.relationship_status,
    photo_urls: photoUrls,
  });

  if (error) {
    return { message: "We couldn't save that — please try again" };
  }

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/location");
}
