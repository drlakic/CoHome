import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getOnboardingState } from "@/lib/onboarding/state";
import { StepNav } from "@/components/onboarding/StepNav";
import { signOut } from "@/app/actions";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // Completed profiles are NOT redirected away — these routes double as the
  // profile editor. Editing mode gets the full app nav (a normal page, not a
  // wizard); first-run onboarding gets a minimal header so new members
  // aren't led out before their profile exists.
  const state = await getOnboardingState(supabase, user.id);
  const editing = state.onboardingCompletedAt != null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-mist/60 bg-linen">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href={editing ? "/browse" : "/onboarding"}
            className="font-heading text-xl text-sage-dark"
          >
            CoHome
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            {editing && (
              <>
                <Link href="/browse" className="transition-colors hover:text-sage-dark">
                  Browse
                </Link>
                <Link href="/matches" className="transition-colors hover:text-sage-dark">
                  Connections
                </Link>
                <Link href="/settings" className="transition-colors hover:text-sage-dark">
                  Settings
                </Link>
              </>
            )}
            <form>
              <button
                formAction={signOut}
                className="text-stone transition-colors hover:text-charcoal"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <header className="mb-8 flex flex-col gap-4">
          <h1 className="text-3xl">
            {editing ? "Update your profile" : "Tell us about your home life"}
          </h1>
          <p className="text-stone">
            {editing
              ? "Change any section whenever life changes — each one saves on its own."
              : "This takes about ten minutes, and you can pick it back up anytime. The more honestly you answer, the better your matches will fit."}
          </p>
          <StepNav completed={state.completed} allReachable={editing} />
        </header>
        {children}
      </div>
    </div>
  );
}
