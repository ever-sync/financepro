import { Skeleton } from "./ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background p-2 md:p-4">
      <div className="hidden w-[3.75rem] shrink-0 flex-col rounded-[28px] border border-border/80 bg-card/70 p-2 shadow-sm md:flex">
        <div className="flex items-center justify-center rounded-[22px] border border-border/70 bg-background p-2 shadow-sm">
          <Skeleton className="size-9 rounded-full" />
        </div>

        <div className="mt-4 flex flex-1 flex-col items-center gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 rounded-[22px] border border-border/70 bg-background p-2 shadow-sm">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-12 w-36 rounded-full md:w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-12 w-56 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-20 w-[min(34rem,100%)] rounded-[28px]" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px] md:col-span-2 xl:col-span-1" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Skeleton className="h-56 rounded-[24px]" />
          <Skeleton className="h-56 rounded-[24px]" />
        </div>

        <Skeleton className="h-72 rounded-[24px]" />
      </div>
    </div>
  );
}
