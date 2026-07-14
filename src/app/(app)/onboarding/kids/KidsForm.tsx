"use client";

import { useActionState, useState } from "react";
import { Field, RadioCards, inputClass } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveKids } from "./actions";
import type { FormState } from "@/lib/validation/form";

interface Defaults {
  has_kids: boolean | null;
  num_kids: number | null;
  kid_ages: number[];
  custody_arrangement: string | null;
  typical_schedule: string;
  roommate_kids_preference: string | null;
}

export function KidsForm({
  defaults,
  editing,
}: {
  defaults: Defaults;
  editing: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveKids,
    null,
  );
  const [hasKids, setHasKids] = useState<boolean>(defaults.has_kids ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field label="Do you have children?">
        <div className="flex gap-2">
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="cursor-pointer rounded-xl border border-mist bg-linen px-5 py-2.5 font-medium transition-colors has-checked:border-sage has-checked:bg-sage-light"
            >
              <input
                type="radio"
                name="has_kids"
                value={opt.value}
                required
                defaultChecked={
                  defaults.has_kids === null
                    ? false
                    : defaults.has_kids === (opt.value === "yes")
                }
                onChange={() => setHasKids(opt.value === "yes")}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Field>

      {hasKids && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="How many" error={state?.fieldErrors?.num_kids?.[0]}>
              <input
                name="num_kids"
                type="number"
                min={1}
                max={20}
                required={hasKids}
                defaultValue={defaults.num_kids ?? ""}
                className={inputClass}
              />
            </Field>
            <Field
              label="Their ages"
              hint="Separated by commas, like 6, 9"
              error={state?.fieldErrors?.kid_ages?.[0]}
            >
              <input
                name="kid_ages"
                defaultValue={defaults.kid_ages.join(", ")}
                className={inputClass}
                placeholder="6, 9"
              />
            </Field>
          </div>

          <Field
            label="How custody works for you"
            error={state?.fieldErrors?.custody_arrangement?.[0]}
          >
            <RadioCards
              name="custody_arrangement"
              defaultValue={defaults.custody_arrangement}
              options={[
                { value: "full_time", label: "They live with me full-time" },
                { value: "shared", label: "Shared custody" },
                { value: "occasional", label: "Occasional visits" },
                { value: "none", label: "They don't stay with me" },
              ]}
            />
          </Field>

          <Field
            label="Typical schedule"
            hint="If it helps a housemate picture the rhythm — like every other weekend, or Wednesdays and alternate weeks."
            error={state?.fieldErrors?.typical_schedule?.[0]}
          >
            <textarea
              name="typical_schedule"
              rows={2}
              maxLength={1000}
              defaultValue={defaults.typical_schedule}
              className={inputClass}
            />
          </Field>
        </>
      )}

      <Field
        label="Living with someone whose kids stay part-time"
        hint="Honest answers help here — this is about fit, and there's no wrong answer."
        error={state?.fieldErrors?.roommate_kids_preference?.[0]}
      >
        <RadioCards
          name="roommate_kids_preference"
          defaultValue={defaults.roommate_kids_preference}
          options={[
            { value: "comfortable", label: "Comfortable with it" },
            { value: "prefer_no_kids", label: "Prefer a kid-free home" },
            { value: "no_preference", label: "No strong preference" },
          ]}
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
