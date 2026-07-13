"use client";

import { useState } from "react";
import { submitReport, blockUser } from "@/lib/actions/report-block";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inputClass } from "@/components/ui/Field";

const REASONS = [
  { value: "dating_solicitation", label: "Approached me romantically" },
  { value: "harassment", label: "Harassment or unkind behaviour" },
  { value: "fake_profile", label: "Doesn't seem to be a real person" },
  { value: "inappropriate_content", label: "Inappropriate photos or text" },
  { value: "safety_concern", label: "I'm worried about safety" },
  { value: "other", label: "Something else" },
];

export function ReportBlockMenu({
  profileId,
  profileName,
  matchId,
}: {
  profileId: string;
  profileName: string;
  matchId?: string;
}) {
  const [open, setOpen] = useState<"none" | "menu" | "report" | "block">("none");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(open === "none" ? "menu" : "none")}
        aria-label="More options"
        className="rounded-full px-3 py-1.5 text-stone transition-colors hover:bg-sand"
      >
        •••
      </button>

      {open === "menu" && (
        <div className="absolute right-0 z-10 mt-1 flex w-44 flex-col rounded-xl bg-linen p-1 shadow-md ring-1 ring-mist">
          <button
            type="button"
            onClick={() => setOpen("report")}
            className="rounded-lg px-3 py-2 text-left transition-colors hover:bg-sand"
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => setOpen("block")}
            className="rounded-lg px-3 py-2 text-left text-terracotta-dark transition-colors hover:bg-sand"
          >
            Block
          </button>
        </div>
      )}

      {open === "report" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-charcoal/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-lg">
            <h3 className="mb-1 text-lg">Report {profileName}</h3>
            <p className="mb-4 text-sm text-stone">
              We'll look into it. They won't know it came from you.
            </p>
            <form action={submitReport} className="flex flex-col gap-3">
              <input type="hidden" name="reported_id" value={profileId} />
              {matchId && <input type="hidden" name="match_id" value={matchId} />}
              <div className="flex flex-col gap-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="cursor-pointer rounded-xl border border-mist bg-linen px-4 py-2 text-sm transition-colors has-checked:border-sage has-checked:bg-sage-light"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      required
                      className="sr-only"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <textarea
                name="details"
                rows={3}
                maxLength={2000}
                placeholder="Anything that would help us understand (optional)"
                className={inputClass}
              />
              <div className="flex items-center gap-3">
                <SubmitButton pendingLabel="Sending…">Send report</SubmitButton>
                <button
                  type="button"
                  onClick={() => setOpen("none")}
                  className="text-stone underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {open === "block" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-charcoal/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-lg">
            <h3 className="mb-1 text-lg">Block {profileName}?</h3>
            <p className="mb-4 text-sm text-stone">
              You won't see each other anywhere on CoHome, and any existing
              conversation closes. They won't be notified.
            </p>
            <form action={blockUser} className="flex items-center gap-3">
              <input type="hidden" name="blocked_id" value={profileId} />
              <SubmitButton pendingLabel="Blocking…">Block</SubmitButton>
              <button
                type="button"
                onClick={() => setOpen("none")}
                className="text-stone underline"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
