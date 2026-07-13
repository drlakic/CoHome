"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const messageSchema = z.object({
  match_id: z.uuid(),
  body: z.string().trim().min(1).max(4000),
});

export interface SentMessage {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export async function sendMessage(
  matchId: string,
  formData: FormData,
): Promise<{ message?: SentMessage; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = messageSchema.safeParse({
    match_id: matchId,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Messages need to be between 1 and 4000 characters" };
  }

  // RLS enforces: participant, status = mutual, no block between the pair.
  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: parsed.data.match_id,
      sender_id: user.id,
      body: parsed.data.body,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: "That didn't send — the conversation may no longer be open" };
  }

  return { message: data };
}
