import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { INTEREST_CATEGORIES } from "@/lib/interests/categories";
import type { InterestGroup } from "@/components/onboarding/InterestPicker";
import { InterestsForm } from "./InterestsForm";

export default async function InterestsPage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [profileRes, catalogRes, mineRes] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("interests").select("id, name, category").order("name"),
    supabase
      .from("profile_interests")
      .select("interest_id")
      .eq("profile_id", user.id),
  ]);

  if (!profileRes.data) redirect("/onboarding/basic-info");

  const catalog = catalogRes.data ?? [];
  const groups: InterestGroup[] = INTEREST_CATEGORIES.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
    tags: catalog
      .filter((i) => i.category === cat.slug)
      .map((i) => ({ id: i.id, name: i.name })),
  })).filter((g) => g.tags.length > 0);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl">What you enjoy</h2>
        <p className="text-stone">
          The things that fill your evenings and weekends.
        </p>
      </div>
      <InterestsForm
        groups={groups}
        defaultSelected={(mineRes.data ?? []).map((row) => row.interest_id)}
      />
    </section>
  );
}
