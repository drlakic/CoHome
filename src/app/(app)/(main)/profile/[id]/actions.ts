"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function expressInterest(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const target = z.uuid().safeParse(formData.get("target_id"));
  if (!target.success || target.data === user.id) redirect("/browse");

  // All match writes go through this RPC — it validates blocks, target
  // visibility, and only ever flips the caller's own interest flag.
  await supabase.rpc("express_interest", { target: target.data });

  revalidatePath(`/profile/${target.data}`);
}
