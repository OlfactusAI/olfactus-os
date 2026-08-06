"use client";

interface NeuralConfidenceCoreProps {
  value: number;
  label?: string;
  size?: "small" | "medium" | "large";
}

export function NeuralConfidenceCore({
  value,
  label = "Confidence",
  size = "medium",
}: NeuralConfidenceCoreProps) {
  return (
    <div
      className={`neural-confidence-core neural-confidence-${size}`}
      aria-label={`${label}: ${value}%`}
    >
      <span className="neural-confidence-ring ring-a" />
      <span className="neural-confidence-ring ring-b" />
      <span className="neural-confidence-ring ring-c" />
      <span className="neural-confidence-node node-one" />
      <span className="neural-confidence-node node-two" />
      <div className="neural-confidence-center">
        <p className="display-serif neural-confidence-value">{value}</p>
        <p className="neural-confidence-label">{label}</p>
      </div>
    </div>
  );
}
