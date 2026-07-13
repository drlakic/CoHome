"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OnboardingStepSlug } from "@/lib/onboarding/state";
import { ONBOARDING_STEPS } from "@/lib/onboarding/state";

export function StepNav({
  completed,
  allReachable = false,
}: {
  completed: Record<OnboardingStepSlug, boolean>;
  allReachable?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Profile steps" className="flex flex-wrap gap-2">
      {ONBOARDING_STEPS.map((step, i) => {
        const href = `/onboarding/${step.slug}`;
        const isCurrent = pathname === href;
        const isDone = completed[step.slug];
        // A step is reachable if it's done or every step before it is done.
        // In editing mode (completed profile) every step is open.
        const reachable =
          allReachable ||
          isDone ||
          ONBOARDING_STEPS.slice(0, i).every((s) => completed[s.slug]);

        const base =
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
        if (!reachable) {
          return (
            <span key={step.slug} className={`${base} text-stone/50`}>
              {step.label}
            </span>
          );
        }
        return (
          <Link
            key={step.slug}
            href={href}
            className={`${base} ${
              isCurrent
                ? "bg-sage text-white"
                : isDone
                  ? "bg-sage-light text-sage-dark"
                  : "text-stone hover:bg-sand"
            }`}
          >
            {isDone && !isCurrent ? "✓ " : ""}
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
