import type {
  TimelineEvent,
  TimelineMetricSnapshot,
} from "@/lib/timeline/types";

export interface TimelineMilestone {
  id: string;
  label: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  progress: number;
}

export interface TimelineTrendPoint {
  timestamp: string;
  label: string;
  value: number;
}

export interface TimelineIntelligenceOutput {
  modelVersion: "TIE-1.0.0";
  collectionAgeDays: number;
  totalEvents: number;
  totalWearsLogged: number;
  bottlesAdded: number;
  currentSnapshot: TimelineMetricSnapshot | null;
  briefing: string;
  milestones: TimelineMilestone[];
  healthTrend: TimelineTrendPoint[];
  diversityTrend: TimelineTrendPoint[];
  rotationTrend: TimelineTrendPoint[];
  projection: {
    metric: string;
    current: number;
    projected: number;
    days: number;
    explanation: string;
  } | null;
  recentEvents: TimelineEvent[];
}

export function analyzeTimelineIntelligence({
  events,
  ledgerCreatedAt,
}: {
  events: TimelineEvent[];
  ledgerCreatedAt: string;
}): TimelineIntelligenceOutput {
  const ordered = [...events].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime(),
  );

  const snapshots = ordered.filter(
    (
      event,
    ): event is TimelineEvent & {
      snapshot: TimelineMetricSnapshot;
    } => Boolean(event.snapshot),
  );

  const currentSnapshot =
    snapshots.at(-1)?.snapshot ?? null;

  const wearEvents = ordered.filter(
    (event) => event.type === "wear_logged",
  );
  const bottleEvents = ordered.filter(
    (event) => event.type === "bottle_added",
  );

  const collectionAgeDays = Math.max(
    0,
    Math.floor(
      (Date.now() -
        new Date(ledgerCreatedAt).getTime()) /
        86_400_000,
    ),
  );

  const milestones = buildMilestones({
    ordered,
    currentSnapshot,
    collectionAgeDays,
  });

  const healthTrend = trendFromSnapshots(
    snapshots,
    "collectionHealth",
  );
  const diversityTrend = trendFromSnapshots(
    snapshots,
    "diversity",
  );
  const rotationTrend = trendFromSnapshots(
    snapshots,
    "rotation",
  );

  return {
    modelVersion: "TIE-1.0.0",
    collectionAgeDays,
    totalEvents: ordered.length,
    totalWearsLogged: wearEvents.length,
    bottlesAdded: bottleEvents.length,
    currentSnapshot,
    briefing: buildBriefing({
      currentSnapshot,
      healthTrend,
      diversityTrend,
      rotationTrend,
      wearEvents: wearEvents.length,
      bottleEvents: bottleEvents.length,
    }),
    milestones,
    healthTrend,
    diversityTrend,
    rotationTrend,
    projection: buildProjection({
      healthTrend,
      currentSnapshot,
    }),
    recentEvents: [...ordered].reverse().slice(0, 18),
  };
}

function buildMilestones({
  ordered,
  currentSnapshot,
  collectionAgeDays,
}: {
  ordered: TimelineEvent[];
  currentSnapshot: TimelineMetricSnapshot | null;
  collectionAgeDays: number;
}): TimelineMilestone[] {
  const wearCount = ordered.filter(
    (event) => event.type === "wear_logged",
  ).length;
  const bottleCount =
    currentSnapshot?.bottleCount ??
    ordered.filter(
      (event) => event.type === "bottle_added",
    ).length;
  const health =
    currentSnapshot?.collectionHealth ?? 0;
  const rotation =
    currentSnapshot?.rotation ?? 0;

  return [
    milestone(
      "first-event",
      "Timeline Activated",
      "The collection began building an intelligence history.",
      ordered.length > 0,
      Math.min(100, ordered.length * 100),
      ordered[0]?.timestamp,
    ),
    milestone(
      "ten-bottles",
      "10-Bottle Collection",
      "The collection reached ten recorded bottles.",
      bottleCount >= 10,
      Math.min(100, bottleCount * 10),
    ),
    milestone(
      "health-90",
      "Collection Health 90",
      "Collection Health entered elite territory.",
      health >= 90,
      Math.min(100, Math.round((health / 90) * 100)),
    ),
    milestone(
      "rotation-85",
      "Rotation Excellence",
      "Rotation quality reached 85 or higher.",
      rotation >= 85,
      Math.min(
        100,
        Math.round((rotation / 85) * 100),
      ),
    ),
    milestone(
      "twenty-five-wears",
      "25 Timeline Wears",
      "Twenty-five wears were logged after Timeline activation.",
      wearCount >= 25,
      Math.min(100, wearCount * 4),
    ),
    milestone(
      "thirty-days",
      "30-Day Intelligence History",
      "OLFACTUS accumulated one month of longitudinal data.",
      collectionAgeDays >= 30,
      Math.min(
        100,
        Math.round(
          (collectionAgeDays / 30) * 100,
        ),
      ),
    ),
  ];
}

function milestone(
  id: string,
  label: string,
  description: string,
  achieved: boolean,
  progress: number,
  achievedAt?: string,
): TimelineMilestone {
  return {
    id,
    label,
    description,
    achieved,
    achievedAt: achieved ? achievedAt : undefined,
    progress,
  };
}

function trendFromSnapshots(
  snapshots: Array<
    TimelineEvent & {
      snapshot: TimelineMetricSnapshot;
    }
  >,
  key:
    | "collectionHealth"
    | "diversity"
    | "rotation",
): TimelineTrendPoint[] {
  return snapshots.slice(-12).map((event) => ({
    timestamp: event.timestamp,
    label: new Date(
      event.timestamp,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: event.snapshot[key],
  }));
}

function buildBriefing({
  currentSnapshot,
  healthTrend,
  diversityTrend,
  rotationTrend,
  wearEvents,
  bottleEvents,
}: {
  currentSnapshot: TimelineMetricSnapshot | null;
  healthTrend: TimelineTrendPoint[];
  diversityTrend: TimelineTrendPoint[];
  rotationTrend: TimelineTrendPoint[];
  wearEvents: number;
  bottleEvents: number;
}) {
  if (!currentSnapshot) {
    return "Timeline Intelligence is collecting its first longitudinal snapshots. Continue using OLFACTUS to establish a meaningful evolution baseline.";
  }

  const healthChange = change(healthTrend);
  const diversityChange = change(diversityTrend);
  const rotationChange = change(rotationTrend);

  return `Your current Collection Health is ${currentSnapshot.collectionHealth}/100. Since the earliest retained snapshot, health changed ${signed(
    healthChange,
  )}, diversity changed ${signed(
    diversityChange,
  )}, and rotation changed ${signed(
    rotationChange,
  )}. The ledger contains ${wearEvents} recorded wears and ${bottleEvents} bottle additions. ${
    rotationChange >= 0
      ? "Wear behavior is moving in a healthier direction."
      : "Rotation requires more balanced use before the next purchase."
  }`;
}

function buildProjection({
  healthTrend,
  currentSnapshot,
}: {
  healthTrend: TimelineTrendPoint[];
  currentSnapshot: TimelineMetricSnapshot | null;
}) {
  if (!currentSnapshot) return null;

  const delta = change(healthTrend);
  const projected = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        currentSnapshot.collectionHealth +
          (delta === 0 ? 1 : delta * 0.65),
      ),
    ),
  );

  return {
    metric: "Collection Health",
    current: currentSnapshot.collectionHealth,
    projected,
    days: 45,
    explanation:
      projected >=
      currentSnapshot.collectionHealth
        ? "Maintaining balanced wears and low-overlap purchasing should continue the current positive trajectory."
        : "The recent trajectory suggests that repetition or redundancy may reduce collection efficiency.",
  };
}

function change(points: TimelineTrendPoint[]) {
  if (points.length < 2) return 0;
  return (
    points.at(-1)!.value - points[0].value
  );
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value} points`;
}
