"use client";

import { useActionState } from "react";
import { Field, RadioCards, inputClass } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { saveBasicInfo } from "./actions";
import type { FormState } from "@/lib/validation/form";
import type { ProfilePhoto } from "@/lib/supabase/database.types";

interface Defaults {
  name: string;
  birthdate: string;
  gender: string;
  bio: string;
  relationship_status: string | null;
  photos: ProfilePhoto[];
}

export function BasicInfoForm({
  defaults,
  editing,
}: {
  defaults: Defaults;
  editing: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveBasicInfo,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field label="Your first name" error={state?.fieldErrors?.name?.[0]}>
        <input
          name="name"
          defaultValue={defaults.name}
          required
          maxLength={100}
          className={inputClass}
          placeholder="What should people call you"
        />
      </Field>

      <Field
        label="Date of birth"
        hint="We show your age, never your birthday. CoHome is for adults 30 and up."
        error={state?.fieldErrors?.birthdate?.[0]}
      >
        <input
          name="birthdate"
          type="date"
          defaultValue={defaults.birthdate}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Gender"
        hint="Optional, in your own words."
        error={state?.fieldErrors?.gender?.[0]}
      >
        <input
          name="gender"
          defaultValue={defaults.gender}
          maxLength={50}
          className={inputClass}
          placeholder="However you describe yourself"
        />
      </Field>

      <Field
        label="Where you are in life"
        error={state?.fieldErrors?.relationship_status?.[0]}
      >
        <RadioCards
          name="relationship_status"
          defaultValue={defaults.relationship_status}
          options={[
            { value: "divorced", label: "Divorced" },
            { value: "widowed", label: "Widowed" },
            { value: "never_married", label: "Never married" },
            { value: "other", label: "It's more complicated" },
          ]}
        />
      </Field>

      <Field
        label="A little about you"
        hint="What your days look like, what you're hoping shared living brings. A few sentences is plenty."
        error={state?.fieldErrors?.bio?.[0]}
      >
        <textarea
          name="bio"
          defaultValue={defaults.bio}
          rows={4}
          maxLength={2000}
          className={inputClass}
        />
      </Field>

      <Field
        label="Photos"
        hint="Everyday photos work best — you at the kitchen table beats a glamour shot."
      >
        <PhotoUploader defaultPhotos={defaults.photos} />
      </Field>

      {state?.message && (
        <p className="text-sm text-terracotta-dark">{state.message}</p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-sage-dark">{state.success}</p>
      )}

      <div>
        <SubmitButton>{editing ? "Save changes" : "Continue"}</SubmitButton>
      </div>
    </form>
  );
}
