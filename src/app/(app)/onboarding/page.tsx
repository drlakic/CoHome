import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getOnboardingState } from "@/lib/onboarding/state";

// /onboarding resumes at the first step that still needs answers; for a
// fully answered profile it lands on the first step as an edit hub.
export default async function OnboardingIndexPage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const state = await getOnboardingState(supabase, user.id);
  redirect(`/onboarding/${state.firstIncomplete ?? "basic-info"}`);
}
