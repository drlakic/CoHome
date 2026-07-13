"use client";

import Link from "next/link";
import { useState } from "react";

interface City {
  id: string;
  name: string;
}
interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
}

// GET form: submitting reloads /browse with ?cities=…&hoods=… params.
// Default (nothing checked) shows the whole region. Neighbourhoods are
// grouped by city and only shown for the cities currently selected.
export function BrowseFilterPanel({
  cities,
  neighborhoods,
  selectedCityIds,
  selectedNeighborhoodIds,
}: {
  cities: City[];
  neighborhoods: Neighborhood[];
  selectedCityIds: string[];
  selectedNeighborhoodIds: string[];
}) {
  const [citySel, setCitySel] = useState<Set<string>>(
    new Set(selectedCityIds),
  );
  const [hoodSel, setHoodSel] = useState<Set<string>>(
    new Set(selectedNeighborhoodIds),
  );

  function toggleCity(id: string) {
    setCitySel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Dropping a city drops its neighbourhood picks too, so the filter
        // can't ask for a neighbourhood in a city that's excluded.
        const cityHoods = new Set(
          neighborhoods.filter((n) => n.city_id === id).map((n) => n.id),
        );
        setHoodSel((prevHoods) => {
          const nextHoods = new Set(prevHoods);
          for (const h of prevHoods) if (cityHoods.has(h)) nextHoods.delete(h);
          return nextHoods;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleHood(id: string) {
    setHoodSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Groups shown: selected cities only; all cities when none selected.
  const visibleGroups = cities
    .filter((c) => citySel.size === 0 || citySel.has(c.id))
    .map((c) => ({
      city: c,
      hoods: neighborhoods.filter((n) => n.city_id === c.id),
    }))
    .filter((g) => g.hoods.length > 0);

  const hasFilters = citySel.size > 0 || hoodSel.size > 0;
  const summaryLabel = hasFilters
    ? ` — ${[
        ...cities.filter((c) => citySel.has(c.id)).map((c) => c.name),
        ...(hoodSel.size > 0
          ? [`${hoodSel.size} neighbourhood${hoodSel.size > 1 ? "s" : ""}`]
          : []),
      ].join(", ")}`
    : " (showing the whole region)";

  return (
    <details
      className="rounded-2xl bg-linen ring-1 ring-mist/60"
      open={selectedCityIds.length > 0 || selectedNeighborhoodIds.length > 0}
    >
      <summary className="cursor-pointer px-5 py-3 font-medium">
        Narrow by area{summaryLabel}
      </summary>
      <form method="get" className="flex flex-col gap-5 px-5 pb-5">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-stone">
            Cities
          </p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <label
                key={c.id}
                className="cursor-pointer rounded-full bg-cream px-4 py-1.5 text-sm ring-1 ring-mist transition-colors has-checked:bg-sage has-checked:font-medium has-checked:text-white"
              >
                <input
                  type="checkbox"
                  name="cities"
                  value={c.id}
                  checked={citySel.has(c.id)}
                  onChange={() => toggleCity(c.id)}
                  className="sr-only"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {visibleGroups.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wide text-stone">
              Neighbourhoods
            </p>
            <p className="mb-3 text-sm text-stone">
              Shows people open to living in any area you pick.
            </p>
            <div className="flex flex-col gap-3">
              {visibleGroups.map((group) => (
                <div key={group.city.id}>
                  <p className="mb-1.5 text-sm font-medium text-stone">
                    {group.city.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.hoods.map((n) => (
                      <label
                        key={n.id}
                        className="cursor-pointer rounded-full bg-cream px-4 py-1.5 text-sm ring-1 ring-mist transition-colors has-checked:bg-sage has-checked:font-medium has-checked:text-white"
                      >
                        <input
                          type="checkbox"
                          name="hoods"
                          value={n.id}
                          checked={hoodSel.has(n.id)}
                          onChange={() => toggleHood(n.id)}
                          className="sr-only"
                        />
                        {n.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-full bg-sage px-5 py-2 font-medium text-white transition-colors hover:bg-sage-dark"
          >
            Apply
          </button>
          {hasFilters && (
            <Link href="/browse" className="text-stone underline">
              Show the whole region
            </Link>
          )}
        </div>
      </form>
    </details>
  );
}
