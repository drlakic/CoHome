"use client";

import { useActionState, useState } from "react";
import { Field, RadioCards, inputClass } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveLocation } from "./actions";
import type { FormState } from "@/lib/validation/form";

interface City {
  id: string;
  name: string;
}
interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
}

interface Defaults {
  city_id: string | null;
  neighborhood_ids: string[];
  budget_min: number | null;
  budget_max: number | null;
  move_in_timeframe: string | null;
}

export function LocationForm({
  cities,
  neighborhoods,
  defaults,
}: {
  cities: City[];
  neighborhoods: Neighborhood[];
  defaults: Defaults;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveLocation,
    null,
  );
  const [cityId, setCityId] = useState<string>(
    defaults.city_id ?? cities[0]?.id ?? "",
  );

  const cityNeighborhoods = neighborhoods.filter((n) => n.city_id === cityId);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field label="Which city" error={state?.fieldErrors?.city_id?.[0]}>
        <select
          name="city_id"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className={inputClass}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {cityNeighborhoods.length > 0 && (
        <Field
          label="Neighbourhoods you'd consider"
          hint="Choose as many as you like — leaving this open means anywhere in the city."
        >
          <div className="flex flex-wrap gap-2">
            {cityNeighborhoods.map((n) => (
              <label
                key={n.id}
                className="cursor-pointer rounded-full border border-mist bg-linen px-4 py-1.5 text-sm transition-colors has-checked:border-sage has-checked:bg-sage-light"
              >
                <input
                  type="checkbox"
                  name="neighborhood_ids"
                  value={n.id}
                  defaultChecked={defaults.neighborhood_ids.includes(n.id)}
                  className="sr-only"
                />
                {n.name}
              </label>
            ))}
          </div>
        </Field>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          label="Budget from (monthly, CAD)"
          error={state?.fieldErrors?.budget_min?.[0]}
        >
          <input
            name="budget_min"
            type="number"
            min={0}
            step={50}
            required
            defaultValue={defaults.budget_min ?? ""}
            className={inputClass}
            placeholder="900"
          />
        </Field>
        <Field
          label="Budget up to"
          error={state?.fieldErrors?.budget_max?.[0]}
        >
          <input
            name="budget_max"
            type="number"
            min={0}
            step={50}
            required
            defaultValue={defaults.budget_max ?? ""}
            className={inputClass}
            placeholder="1600"
          />
        </Field>
      </div>

      <Field
        label="When you'd like to move"
        error={state?.fieldErrors?.move_in_timeframe?.[0]}
      >
        <RadioCards
          name="move_in_timeframe"
          defaultValue={defaults.move_in_timeframe}
          options={[
            { value: "immediate", label: "As soon as possible" },
            { value: "within_1_month", label: "Within a month" },
            { value: "within_3_months", label: "Within three months" },
            { value: "flexible", label: "I'm flexible" },
          ]}
        />
      </Field>

      {state?.message && (
        <p className="text-sm text-terracotta-dark">{state.message}</p>
      )}

      <div>
        <SubmitButton>Continue</SubmitButton>
      </div>
    </form>
  );
}
