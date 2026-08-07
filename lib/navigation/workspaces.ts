import {
  BrainCircuit,
  GitCompareArrows,
  BadgeDollarSign,
  BookOpen,
  ChartNoAxesCombined,
  Compass,
  Database,
  Dna,
  FlaskConical,
  History,
  GitBranch,
  Landmark,
  LayoutDashboard,
  Library,
  Network,
  Radar,
  Search,
  Brush,
  UserRound,
  UploadCloud,
  Beaker,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type WorkspaceSection =
  | "Dashboard"
  | "Knowledge"
  | "Analytics"
  | "Account";

export interface WorkspaceDefinition {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  section: WorkspaceSection;
  icon: LucideIcon;
  keywords: string[];
}

export const workspaces: WorkspaceDefinition[] = [
  {
    href: "/today",
    label: "Today",
    shortLabel: "Today",
    description: "Daily fragrance intelligence dashboard.",
    section: "Dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "dashboard", "weather"],
  },
  {
    href: "/collection",
    label: "Collection",
    shortLabel: "Collection",
    description: "Manage owned fragrances and wear activity.",
    section: "Dashboard",
    icon: Library,
    keywords: ["owned", "bottles", "wardrobe"],
  },
  {
    href: "/discover",
    label: "Discover",
    shortLabel: "Discover",
    description: "Personalized fragrance discovery.",
    section: "Dashboard",
    icon: Compass,
    keywords: ["recommend", "find", "new"],
  },
  {
    href: "/entity-compare",
    label: "Entity Compare",
    shortLabel: "Compare",
    description: "Compare fragrances, brands, and perfumers across universal entity metrics.",
    section: "Knowledge",
    icon: GitCompareArrows,
    keywords: ["compare", "entity", "fragrance", "brand", "perfumer"],
  },
  {
    href: "/entities",
    label: "Entity Platform",
    shortLabel: "Entities",
    description: "Universal registry and data-driven dossiers for every intelligence entity.",
    section: "Knowledge",
    icon: Network,
    keywords: ["entity", "registry", "dossier", "brand", "perfumer", "note", "accord"],
  },
  {
    href: "/explorer",
    label: "Explorer",
    shortLabel: "Explorer",
    description: "Advanced database search and comparison.",
    section: "Knowledge",
    icon: Search,
    keywords: ["search", "filter", "compare"],
  },
  {
    href: "/database",
    label: "Database",
    shortLabel: "Database",
    description: "Global fragrance data foundation.",
    section: "Knowledge",
    icon: Database,
    keywords: ["catalog", "records", "quality"],
  },
  {
    href: "/import",
    label: "Import Workspace",
    shortLabel: "Import",
    description: "Upload, review, resolve, and commit fragrance datasets.",
    section: "Knowledge",
    icon: UploadCloud,
    keywords: ["upload", "csv", "json", "dataset", "merge"],
  },
  {
    href: "/brands",
    label: "Brands",
    shortLabel: "Brands",
    description: "Brand dossiers, DNA, and portfolio intelligence.",
    section: "Knowledge",
    icon: Landmark,
    keywords: ["houses", "creed", "amouage"],
  },
  {
    href: "/perfumers",
    label: "Perfumers",
    shortLabel: "Perfumers",
    description: "Creator portfolios, signature DNA, and creative networks.",
    section: "Knowledge",
    icon: Brush,
    keywords: ["creators", "noses", "perfumers", "credits"],
  },
  {
    href: "/genome",
    label: "Genome",
    shortLabel: "Genome",
    description: "Collection and taste DNA.",
    section: "Knowledge",
    icon: Dna,
    keywords: ["dna", "taste", "profile"],
  },
  {
    href: "/graph",
    label: "Knowledge Graph",
    shortLabel: "Graph",
    description: "Explore fragrance relationships and connections.",
    section: "Knowledge",
    icon: Network,
    keywords: ["network", "connections", "overlap"],
  },
  {
    href: "/lineage",
    label: "Lineage",
    shortLabel: "Lineage",
    description: "Fragrance family trees, chronology, and DNA evolution.",
    section: "Knowledge",
    icon: GitBranch,
    keywords: ["flanker", "family", "evolution", "concentration"],
  },
  {
    href: "/simulator",
    label: "Neural Simulator",
    shortLabel: "Simulator",
    description: "Model collection changes before committing them.",
    section: "Analytics",
    icon: Beaker,
    keywords: ["what if", "simulate", "purchase", "impact"],
  },
  {
    href: "/predictions",
    label: "Predictions",
    shortLabel: "Predict",
    description: "Forward-looking retention, signature, taste drift, and adaptive recommendation intelligence.",
    section: "Analytics",
    icon: Radar,
    keywords: ["predict", "forecast", "future", "drift", "retention", "signature"],
  },
  {
    href: "/memory",
    label: "Memory",
    shortLabel: "Memory",
    description: "Persistent collector memory, learned behavior, and Collector DNA.",
    section: "Analytics",
    icon: BrainCircuit,
    keywords: ["memory", "behavior", "learning", "collector dna", "history"],
  },
  {
    href: "/timeline",
    label: "Timeline",
    shortLabel: "Timeline",
    description: "Collection activity and intelligence history.",
    section: "Analytics",
    icon: History,
    keywords: ["history", "events", "wears"],
  },
  {
    href: "/evolution",
    label: "Evolution",
    shortLabel: "Evolution",
    description: "Interactive collection evolution replay.",
    section: "Analytics",
    icon: ChartNoAxesCombined,
    keywords: ["change", "replay", "snapshots"],
  },
  {
    href: "/annual-review",
    label: "Annual Review",
    shortLabel: "Review",
    description: "Year-in-review taste and collection intelligence.",
    section: "Analytics",
    icon: BookOpen,
    keywords: ["year", "summary", "report"],
  },
  {
    href: "/market",
    label: "Market",
    shortLabel: "Market",
    description: "Collection value and market intelligence.",
    section: "Analytics",
    icon: Landmark,
    keywords: ["value", "price", "portfolio"],
  },
  {
    href: "/deal-lab",
    label: "Deal Lab",
    shortLabel: "Deal Lab",
    description: "Analyze offers, prices, and buy windows.",
    section: "Analytics",
    icon: BadgeDollarSign,
    keywords: ["deal", "offer", "price", "buy"],
  },
  {
    href: "/decisions",
    label: "Decisions",
    shortLabel: "Decisions",
    description: "Purchase and collection decision intelligence.",
    section: "Analytics",
    icon: FlaskConical,
    keywords: ["decision", "buy", "risk"],
  },
  {
    href: "/system",
    label: "System",
    shortLabel: "System",
    description: "Recovery, diagnostics, backups, and runtime health.",
    section: "Account",
    icon: Settings,
    keywords: ["system", "diagnostics", "backup", "restore", "undo"],
  },
  {
    href: "/account",
    label: "Account & Sync",
    shortLabel: "Account",
    description: "Authentication, synchronization, privacy, and data ownership.",
    section: "Account",
    icon: UserRound,
    keywords: ["account", "login", "sync", "cloud", "privacy"],
  },
  {
    href: "/profile",
    label: "Coach & Profile",
    shortLabel: "Profile",
    description: "Collector profile, preferences, and coaching.",
    section: "Account",
    icon: UserRound,
    keywords: ["profile", "coach", "settings"],
  },
];

export const workspaceSections: WorkspaceSection[] = [
  "Dashboard",
  "Knowledge",
  "Analytics",
  "Account",
];

export function findWorkspace(pathname: string) {
  return workspaces.find(
    (workspace) =>
      pathname === workspace.href ||
      pathname.startsWith(`${workspace.href}/`),
  );
}

export function searchWorkspaces(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return workspaces;

  return workspaces
    .map((workspace) => {
      const fields = [
        workspace.label,
        workspace.description,
        workspace.section,
        ...workspace.keywords,
      ].map((value) => value.toLowerCase());

      const score = fields.reduce((total, field, index) => {
        if (field === normalized) return total + 80 - index;
        if (field.startsWith(normalized)) return total + 40 - index;
        if (field.includes(normalized)) return total + 20 - index;
        return total;
      }, 0);

      return { workspace, score };
    })
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.workspace.label.localeCompare(b.workspace.label),
    )
    .map((result) => result.workspace);
}
