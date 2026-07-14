import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-64 w-64 flex-shrink-0" />
        <Skeleton className="hidden h-64 w-64 flex-shrink-0 sm:block" />
      </div>
      <Skeleton className="h-36 w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  );
}
