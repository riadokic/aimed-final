import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-skeleton rounded-full bg-aimed-gray-200", className)} />
  );
}

export function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-aimed-gray-400">
        {title}
      </p>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}
