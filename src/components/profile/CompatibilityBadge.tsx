export function CompatibilityBadge({
  percent,
  size = "sm",
}: {
  percent: number;
  size?: "sm" | "lg";
}) {
  // Terracotta is the accent for strong compatibility; sage for the rest.
  const strong = percent >= 80;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${
        strong ? "bg-terracotta" : "bg-sage"
      } ${size === "lg" ? "px-4 py-1.5" : "px-3 py-1 text-sm"}`}
    >
      {percent}% compatible
    </span>
  );
}
