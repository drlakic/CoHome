import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { LocationForm } from "./LocationForm";

export default async function LocationPage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [profileRes, citiesRes, neighborhoodsRes, prefsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("city_id, budget_min, budget_max, move_in_timeframe, onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("cities")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase.from("neighborhoods").select("id, city_id, name").order("name"),
    supabase
      .from("profile_neighborhood_preferences")
      .select("neighborhood_id")
      .eq("profile_id", user.id),
  ]);

  if (!profileRes.data) redirect("/onboarding/basic-info");

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl">Where and when</h2>
        <p className="text-stone">
          Where you'd like to live, what works for your budget, and your timing.
        </p>
      </div>
      <LocationForm
        editing={profileRes.data.onboarding_completed_at != null}
        cities={citiesRes.data ?? []}
        neighborhoods={neighborhoodsRes.data ?? []}
        defaults={{
          city_id: profileRes.data.city_id,
          neighborhood_ids: (prefsRes.data ?? []).map((p) => p.neighborhood_id),
          budget_min: profileRes.data.budget_min,
          budget_max: profileRes.data.budget_max,
          move_in_timeframe: profileRes.data.move_in_timeframe,
        }}
      />
    </section>
  );
}
