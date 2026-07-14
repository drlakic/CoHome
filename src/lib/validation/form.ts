import { z } from "zod";

export type FormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  success?: string;
} | null;

export function toFormState(error: z.ZodError): FormState {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return {
    fieldErrors,
    message: formErrors[0],
  };
}
