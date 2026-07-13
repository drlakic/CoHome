export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-medium">{label}</label>
      {hint && <p className="text-sm text-stone">{hint}</p>}
      {children}
      {error && <p className="text-sm text-terracotta-dark">{error}</p>}
    </div>
  );
}

export const inputClass =
  "rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none transition-colors focus:border-sage placeholder:text-stone/60";

export function RadioCards({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  defaultValue?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="cursor-pointer rounded-xl border border-mist bg-linen px-4 py-2.5 transition-colors has-checked:border-sage has-checked:bg-sage-light"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={defaultValue === opt.value}
            className="sr-only"
            required
          />
          <span className="font-medium">{opt.label}</span>
          {opt.hint && <span className="block text-sm text-stone">{opt.hint}</span>}
        </label>
      ))}
    </div>
  );
}

export function ScaleField({
  name,
  low,
  high,
  defaultValue,
}: {
  name: string;
  low: string;
  high: string;
  defaultValue?: number | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-mist bg-linen font-medium transition-colors has-checked:border-sage has-checked:bg-sage has-checked:text-white"
          >
            <input
              type="radio"
              name={name}
              value={n}
              defaultChecked={defaultValue === n}
              className="sr-only"
              required
            />
            {n}
          </label>
        ))}
      </div>
      <div className="flex justify-between text-sm text-stone" style={{ maxWidth: "17rem" }}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
