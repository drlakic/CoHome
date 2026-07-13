"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateNotifications(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      notify_new_match: formData.get("notify_new_match") === "on",
      notify_new_message: formData.get("notify_new_message") === "on",
    })
    .eq("id", user.id);

  redirect("/settings?saved=1");
}

export async function unblockUser(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const blockedId = z.uuid().safeParse(formData.get("blocked_id"));
  if (blockedId.success) {
    await supabase
      .from("blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId.data);
  }

  revalidatePath("/settings/blocked");
}

export async function deleteAccount(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A typed confirmation guards against accidental submission.
  if (String(formData.get("confirm_phrase")).trim().toLowerCase() !== "delete") {
    redirect("/settings?error=" + encodeURIComponent("Please type DELETE to confirm"));
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    redirect(
      "/settings?error=" +
        encodeURIComponent(
          "Account deletion isn't configured on this server yet — please contact us",
        ),
    );
  }

  // Deleting the auth user cascades to the profile and everything under it.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    redirect(
      "/settings?error=" +
        encodeURIComponent("We couldn't delete your account — please try again"),
    );
  }

  await supabase.auth.signOut();
  redirect("/?goodbye=1");
}
