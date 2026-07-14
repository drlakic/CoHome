"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  InterestPicker,
  type InterestGroup,
} from "@/components/onboarding/InterestPicker";
import { saveInterests } from "./actions";
import type { FormState } from "@/lib/validation/form";

export function InterestsForm({
  groups,
  defaultSelected,
  editing,
}: {
  groups: InterestGroup[];
  defaultSelected: string[];
  editing: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveInterests,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field
        label="Your interests"
        hint="Shared interests make a house feel like company rather than just split rent. Pick anything that's genuinely you — the everyday counts as much as the impressive."
        error={state?.fieldErrors?.interest_ids?.[0]}
      >
        <InterestPicker
          name="interest_ids"
          groups={groups}
          defaultSelected={defaultSelected}
        />
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
