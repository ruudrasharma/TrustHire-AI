"use client";

/** Skeleton loading components — pulse animation, never spin */

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded h-4 ${className}`} aria-hidden="true" />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`} aria-hidden="true" aria-busy="true">
      <SkeletonLine className="w-1/3 h-3" />
      <SkeletonLine className="w-full h-5" />
      <SkeletonLine className="w-2/3 h-3" />
      <div className="flex gap-2 pt-1">
        <SkeletonLine className="w-16 h-6 rounded-full" />
        <SkeletonLine className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonDriveCard() {
  return (
    <div className="card p-5 space-y-3" aria-hidden="true">
      <div className="flex items-start justify-between">
        <SkeletonLine className="w-24 h-3" />
        <SkeletonLine className="w-14 h-5 rounded-full" />
      </div>
      <SkeletonLine className="w-40 h-6" />
      <SkeletonLine className="w-28 h-3" />
      <div className="flex gap-2 pt-2">
        <SkeletonLine className="w-16 h-5 rounded-full" />
        <SkeletonLine className="w-20 h-5 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading…" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDriveCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfileHeader() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <div className="skeleton w-14 h-14 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonLine className="w-36 h-5" />
        <SkeletonLine className="w-48 h-3" />
      </div>
    </div>
  );
}
