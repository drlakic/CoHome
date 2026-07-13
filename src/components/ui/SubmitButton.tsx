"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-sage px-6 py-2.5 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
