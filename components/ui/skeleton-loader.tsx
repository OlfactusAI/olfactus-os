export function SkeletonLoader({
  lines = 4,
}: {
  lines?: number;
}) {
  return (
    <div className="nexus-skeleton" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          style={{
            width: `${Math.max(42, 100 - index * 13)}%`,
          }}
        />
      ))}
    </div>
  );
}
