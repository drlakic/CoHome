"use client";

import { useState } from "react";

export interface InterestGroup {
  slug: string;
  label: string;
  tags: { id: string; name: string }[];
}

export function InterestPicker({
  groups,
  defaultSelected,
  name,
  maxTags = 30,
}: {
  groups: InterestGroup[];
  defaultSelected: string[];
  name: string;
  maxTags?: number;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxTags) {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <input type="hidden" name={name} value={JSON.stringify([...selected])} />
      {groups.map((group) => (
        <div key={group.slug}>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => {
              const isOn = selected.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggle(tag.id)}
                  aria-pressed={isOn}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    isOn
                      ? "bg-sage font-medium text-white"
                      : "bg-linen ring-1 ring-mist hover:ring-sage"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-sm text-stone">
        {selected.size} selected
        {selected.size >= maxTags ? ` — that's the limit of ${maxTags}` : ""}
      </p>
    </div>
  );
}
