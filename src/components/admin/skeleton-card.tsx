export function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-[#e8e6e1] bg-white p-3 ${
        tall ? "h-20" : "h-16"
      }`}
    >
      <div className="mb-2 h-2 w-1/2 rounded bg-[#f0ede8]" />
      <div className="h-6 w-1/3 rounded bg-[#f0ede8]" />
    </div>
  );
}
