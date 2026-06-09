import { Skeleton } from "@/components/commons/skeleton";

export default function StockDetailLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
