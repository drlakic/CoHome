"use client";

import { useActionState } from "react";
import { Field, RadioCards, ScaleField, inputClass } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveLifestyle } from "./actions";
import type { FormState } from "@/lib/validation/form";

interface Defaults {
  pets: string | null;
  smoking: string | null;
  cleanliness_level: number | null;
  schedule_type: string | null;
  noise_tolerance: number | null;
  overnight_guests_frequency: string | null;
  overnight_guests_notice: string | null;
  dating_while_cohabiting_preference: string | null;
  hosting_frequency: string | null;
  shared_space_guest_policy: string;
}

export function LifestyleForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveLifestyle,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field label="Pets" error={state?.fieldErrors?.pets?.[0]}>
        <RadioCards
          name="pets"
          defaultValue={defaults.pets}
          options={[
            { value: "has_pets", label: "I have a pet" },
            { value: "okay_with_pets", label: "Happy to live with pets" },
            { value: "no_pets", label: "Prefer a pet-free home" },
          ]}
        />
      </Field>

      <Field label="Smoking" error={state?.fieldErrors?.smoking?.[0]}>
        <RadioCards
          name="smoking"
          defaultValue={defaults.smoking}
          options={[
            { value: "no", label: "I don't smoke" },
            { value: "outside_only", label: "Outside only" },
            { value: "yes", label: "I smoke" },
          ]}
        />
      </Field>

      <Field
        label="How you keep shared spaces"
        hint="There's no right answer — matching honestly is what keeps a home easy."
        error={state?.fieldErrors?.cleanliness_level?.[0]}
      >
        <ScaleField
          name="cleanliness_level"
          low="Lived-in"
          high="Everything in its place"
          defaultValue={defaults.cleanliness_level}
        />
      </Field>

      <Field label="Your daily rhythm" error={state?.fieldErrors?.schedule_type?.[0]}>
        <RadioCards
          name="schedule_type"
          defaultValue={defaults.schedule_type}
          options={[
            { value: "early_riser", label: "Early riser" },
            { value: "night_owl", label: "Night owl" },
            { value: "flexible", label: "Depends on the day" },
          ]}
        />
      </Field>

      <Field
        label="Noise at home"
        error={state?.fieldErrors?.noise_tolerance?.[0]}
      >
        <ScaleField
          name="noise_tolerance"
          low="I like quiet"
          high="Sound doesn't bother me"
          defaultValue={defaults.noise_tolerance}
        />
      </Field>

      <Field
        label="Overnight guests"
        error={state?.fieldErrors?.overnight_guests_frequency?.[0]}
      >
        <RadioCards
          name="overnight_guests_frequency"
          defaultValue={defaults.overnight_guests_frequency}
          options={[
            { value: "never", label: "Rarely or never" },
            { value: "occasionally", label: "Now and then" },
            { value: "regularly", label: "Fairly often" },
          ]}
        />
      </Field>

      <Field
        label="Heads-up before a guest stays over"
        error={state?.fieldErrors?.overnight_guests_notice?.[0]}
      >
        <RadioCards
          name="overnight_guests_notice"
          defaultValue={defaults.overnight_guests_notice}
          options={[
            { value: "no_notice_needed", label: "No heads-up needed" },
            { value: "some_notice", label: "A mention beforehand" },
            { value: "advance_notice_required", label: "Real notice, please" },
          ]}
        />
      </Field>

      <Field
        label="A housemate who's dating"
        hint="People date. This is just about what feels comfortable under a shared roof."
        error={state?.fieldErrors?.dating_while_cohabiting_preference?.[0]}
      >
        <RadioCards
          name="dating_while_cohabiting_preference"
          defaultValue={defaults.dating_while_cohabiting_preference}
          options={[
            { value: "comfortable", label: "Completely fine" },
            { value: "prefer_discreet", label: "Fine, kept low-key" },
            { value: "prefer_not_dating", label: "Prefer a housemate who isn't dating" },
          ]}
        />
      </Field>

      <Field
        label="Hosting gatherings"
        error={state?.fieldErrors?.hosting_frequency?.[0]}
      >
        <RadioCards
          name="hosting_frequency"
          defaultValue={defaults.hosting_frequency}
          options={[
            { value: "never", label: "Rarely or never" },
            { value: "small_only", label: "Small get-togethers" },
            { value: "regularly", label: "I like to host" },
          ]}
        />
      </Field>

      <Field
        label="Anything else about guests and shared spaces"
        hint="In your own words — how you'd like the living room, kitchen, and visits to work."
        error={state?.fieldErrors?.shared_space_guest_policy?.[0]}
      >
        <textarea
          name="shared_space_guest_policy"
          rows={3}
          maxLength={1000}
          defaultValue={defaults.shared_space_guest_policy}
          className={inputClass}
        />
      </Field>

      {state?.message && (
        <p className="text-sm text-terracotta-dark">{state.message}</p>
      )}

      <div>
        <SubmitButton pendingLabel="Finishing up…">
          Finish my profile
        </SubmitButton>
      </div>
    </form>
  );
}
