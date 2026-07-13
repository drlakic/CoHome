"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  reported_id: z.uuid(),
  match_id: z.uuid().nullable(),
  reason: z.enum([
    "inappropriate_content",
    "harassment",
    "fake_profile",
    "dating_solicitation",
    "safety_concern",
    "other",
  ]),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function submitReport(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = reportSchema.safeParse({
    reported_id: formData.get("reported_id"),
    match_id: formData.get("match_id") || null,
    reason: formData.get("reason"),
    details: formData.get("details"),
  });
  if (!parsed.success || parsed.data.reported_id === user.id) {
    redirect("/browse");
  }

  await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: parsed.data.reported_id,
    match_id: parsed.data.match_id,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });

  redirect(`/profile/${parsed.data.reported_id}?reported=1`);
}

export async function blockUser(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const blockedId = z.uuid().safeParse(formData.get("blocked_id"));
  if (!blockedId.success || blockedId.data === user.id) {
    redirect("/browse");
  }

  // The on_block_decline_match trigger severs any existing connection.
  await supabase.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: blockedId.data,
  });

  revalidatePath("/browse");
  redirect("/browse");
}
