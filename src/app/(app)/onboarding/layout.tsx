import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getOnboardingState } from "@/lib/onboarding/state";
import { StepNav } from "@/components/onboarding/StepNav";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // Completed profiles are NOT redirected away — these routes double as the
  // profile editor until the Phase 5 settings page exists. Editing mode
  // unlocks every step and adjusts the framing.
  const state = await getOnboardingState(supabase, user.id);
  const editing = state.onboardingCompletedAt != null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4">
        <h1 className="text-3xl">
          {editing ? "Update your profile" : "Tell us about your home life"}
        </h1>
        <p className="text-stone">
          {editing
            ? "Change any section whenever life changes — your answers keep your matches honest."
            : "This takes about ten minutes, and you can pick it back up anytime. The more honestly you answer, the better your matches will fit."}
        </p>
        <StepNav completed={state.completed} allReachable={editing} />
      </header>
      {children}
    </div>
  );
}
