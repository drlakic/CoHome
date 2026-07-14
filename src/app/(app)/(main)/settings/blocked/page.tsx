import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { unblockUser } from "../actions";

export default async function BlockedMembersPage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { data: blocked } = await supabase.rpc("blocked_members");

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/settings" className="text-sm text-stone underline">
          Back to settings
        </Link>
        <h1 className="mt-2 text-2xl">Blocked members</h1>
        <p className="text-stone">
          Unblocking makes you visible to each other again in browsing. It
          does not reopen past conversations.
        </p>
      </div>

      {!blocked || blocked.length === 0 ? (
        <div className="rounded-2xl bg-linen p-8 text-center ring-1 ring-mist/60">
          <p className="text-stone">You haven't blocked anyone.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {blocked.map((b) => (
            <li
              key={b.blocked_id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-linen p-4 ring-1 ring-mist/60"
            >
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-stone">
                  Blocked {new Date(b.created_at).toLocaleDateString()}
                </p>
              </div>
              <form action={unblockUser}>
                <input type="hidden" name="blocked_id" value={b.blocked_id} />
                <button
                  type="submit"
                  className="rounded-full border border-mist bg-cream px-4 py-1.5 text-sm font-medium transition-colors hover:border-sage"
                >
                  Unblock
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
