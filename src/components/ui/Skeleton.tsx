export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-sand/80 ${className}`}
      aria-hidden
    />
  );
}
