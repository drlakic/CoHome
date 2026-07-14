import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inputClass } from "@/components/ui/Field";
import { updateNotifications, deleteAccount } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_new_match, notify_new_message")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl">Settings</h1>
        <p className="text-stone">Your account, your preferences.</p>
      </div>

      {saved && (
        <p className="rounded-xl bg-sage-light px-4 py-3 text-sage-dark">
          Saved.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-terracotta-light px-4 py-3 text-terracotta-dark">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-linen p-6 ring-1 ring-mist/60">
        <h2 className="text-lg">Your profile</h2>
        <p className="text-stone">
          Everything you shared during sign-up — photos, location, interests,
          house rules — can be updated anytime.
        </p>
        <div>
          <Link
            href="/onboarding"
            className="inline-block rounded-full bg-sage px-5 py-2 font-medium text-white transition-colors hover:bg-sage-dark"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <form
        action={updateNotifications}
        className="flex flex-col gap-4 rounded-2xl bg-linen p-6 ring-1 ring-mist/60"
      >
        <h2 className="text-lg">Email notifications</h2>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="notify_new_match"
            defaultChecked={profile.notify_new_match}
            className="h-5 w-5 accent-[#8a9a82]"
          />
          When someone becomes a new connection
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="notify_new_message"
            defaultChecked={profile.notify_new_message}
            className="h-5 w-5 accent-[#8a9a82]"
          />
          When a connection sends me a message
        </label>
        <div>
          <SubmitButton>Save preferences</SubmitButton>
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl bg-linen p-6 ring-1 ring-mist/60">
        <h2 className="text-lg">Blocked members</h2>
        <p className="text-stone">
          People you've blocked can't see you anywhere on CoHome, and you
          can't see them.
        </p>
        <div>
          <Link href="/settings/blocked" className="text-sage-dark underline">
            Manage blocked members
          </Link>
        </div>
      </div>

      <details className="rounded-2xl bg-linen p-6 ring-1 ring-mist/60">
        <summary className="cursor-pointer text-lg font-medium text-terracotta-dark">
          Delete my account
        </summary>
        <form action={deleteAccount} className="mt-4 flex flex-col gap-3">
          <p className="text-stone">
            This permanently removes your profile, connections, and messages.
            There's no undo. If you're just taking a break, you can simply
            sign out — your profile only appears to people while you're a
            member.
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Type <strong>DELETE</strong> to confirm
            </span>
            <input
              name="confirm_phrase"
              required
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <div>
            <button
              type="submit"
              className="rounded-full bg-terracotta px-5 py-2 font-medium text-white transition-colors hover:bg-terracotta-dark"
            >
              Permanently delete my account
            </button>
          </div>
        </form>
      </details>
    </section>
  );
}
