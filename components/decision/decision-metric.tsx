"use client";

interface DecisionMetricProps {
  label: string;
  value: number;
  detail?: string;
  inverse?: boolean;
}

export function DecisionMetric({
  label,
  value,
  detail,
  inverse = false,
}: DecisionMetricProps) {
  const favorable = inverse ? 100 - value : value;

  return (
    <div className="decision-metric">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          {detail ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
          ) : null}
        </div>
        <p className="display-serif text-3xl text-[var(--gold-bright)]">
          {value}
        </p>
      </div>

      <div className="decision-metric-track mt-3">
        <span style={{ width: `${Math.max(0, Math.min(100, favorable))}%` }} />
      </div>
    </div>
  );
}
