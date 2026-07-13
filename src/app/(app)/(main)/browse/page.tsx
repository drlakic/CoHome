import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchProfileBundle,
  fetchScoredCandidates,
} from "@/lib/supabase/queries/browse";
import { ProfileCard } from "@/components/browse/ProfileCard";
import { BrowseFilterPanel } from "@/components/browse/BrowseFilterPanel";

function toIdList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter((v) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    cities?: string | string[];
    hoods?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const viewer = await fetchProfileBundle(supabase, user.id);
  if (!viewer) redirect("/onboarding");

  const selectedCityIds = toIdList(params.cities);
  const selectedNeighborhoodIds = toIdList(params.hoods);

  // Metro cities + their neighborhoods for the filter panel.
  const { data: viewerCity } = viewer.profile.city_id
    ? await supabase
        .from("cities")
        .select("metro_area")
        .eq("id", viewer.profile.city_id)
        .single()
    : { data: null };

  const { data: metroCities } = viewerCity
    ? await supabase
        .from("cities")
        .select("id, name")
        .eq("metro_area", viewerCity.metro_area)
        .eq("is_active", true)
        .order("name")
    : { data: [] };

  const metroCityIds = (metroCities ?? []).map((c) => c.id);
  const { data: neighborhoods } =
    metroCityIds.length > 0
      ? await supabase
          .from("neighborhoods")
          .select("id, city_id, name")
          .in("city_id", metroCityIds)
          .order("name")
      : { data: [] };

  const candidates = await fetchScoredCandidates(supabase, viewer, {
    cityIds: selectedCityIds,
    neighborhoodIds: selectedNeighborhoodIds,
  });

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl">People near you</h1>
        <p className="text-stone">
          Everyone in your region, sorted by how well your day-to-day lives fit
          together.
        </p>
      </div>

      <BrowseFilterPanel
        cities={metroCities ?? []}
        neighborhoods={neighborhoods ?? []}
        selectedCityIds={selectedCityIds}
        selectedNeighborhoodIds={selectedNeighborhoodIds}
      />

      {candidates.length === 0 ? (
        <div className="rounded-2xl bg-linen p-8 text-center ring-1 ring-mist/60">
          <p className="mb-1 font-medium">No one to show just yet</p>
          <p className="text-stone">
            {selectedCityIds.length > 0 || selectedNeighborhoodIds.length > 0
              ? "Nobody fits those filters right now — try widening the area."
              : "CoHome is new in your region, and profiles are arriving steadily. Check back soon — we'd rather show you a few genuinely compatible people than a long list of poor fits."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <ProfileCard key={c.bundle.profile.id} candidate={c} />
          ))}
        </div>
      )}
    </section>
  );
}
