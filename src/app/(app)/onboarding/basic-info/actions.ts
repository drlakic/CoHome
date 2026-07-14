"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { basicInfoSchema } from "@/lib/validation/onboarding";
import { toFormState, type FormState } from "@/lib/validation/form";
import type { ProfilePhoto } from "@/lib/supabase/database.types";

// Photos must live in our own storage bucket — no external URLs.
const photosSchema = z
  .array(
    z.object({
      url: z
        .string()
        .url()
        .refine((u) =>
          u.startsWith(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/`,
          ),
        ),
      pos_x: z.number().min(0).max(100),
      pos_y: z.number().min(0).max(100),
    }),
  )
  .max(4);

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

  let photos: ProfilePhoto[] = [];
  try {
    const raw = JSON.parse(String(formData.get("photos") ?? "[]"));
    const validated = photosSchema.safeParse(raw);
    if (validated.success) photos = validated.data;
  } catch {
    photos = [];
  }

  // Editing an already-completed profile stays on this page; first-run
  // onboarding continues to the next step.
  const { data: existing } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  const editing = existing?.onboarding_completed_at != null;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: parsed.data.name,
    birthdate: parsed.data.birthdate,
    gender: parsed.data.gender || null,
    bio: parsed.data.bio || null,
    relationship_status: parsed.data.relationship_status,
    photos,
  });

  if (error) {
    return { message: "We couldn't save that — please try again" };
  }

  revalidatePath("/onboarding", "layout");
  if (editing) return { success: "Saved" };
  redirect("/onboarding/location");
}
