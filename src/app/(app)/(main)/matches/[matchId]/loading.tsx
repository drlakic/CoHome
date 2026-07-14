import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatLoading() {
  return (
    <section className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-6 w-44" />
      </div>
      <Skeleton className="flex-1 w-full" />
      <Skeleton className="h-16 w-full" />
    </section>
  );
}
