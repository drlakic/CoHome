import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { UnreadBadge } from "@/components/chat/UnreadBadge";

// Everything in this group requires a completed profile. Onboarding lives
// outside it (directly under (app)) so members can still get there.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  const { data: unreadCount } = await supabase.rpc("unread_message_count");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-mist/60 bg-linen">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/browse" className="font-heading text-xl text-sage-dark">
            CoHome
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/browse" className="transition-colors hover:text-sage-dark">
              Browse
            </Link>
            <Link
              href="/matches"
              className="flex items-center gap-1.5 transition-colors hover:text-sage-dark"
            >
              Connections
              <UnreadBadge initialCount={unreadCount ?? 0} />
            </Link>
            <Link href="/onboarding" className="transition-colors hover:text-sage-dark">
              Edit profile
            </Link>
            <Link href="/settings" className="transition-colors hover:text-sage-dark">
              Settings
            </Link>
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
