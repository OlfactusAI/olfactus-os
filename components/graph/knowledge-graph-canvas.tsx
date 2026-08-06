"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ChevronDown,
  Expand,
  Focus,
  Layers3,
  Minus,
  Plus,
  Search,
  Shrink,
} from "lucide-react";

import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeNodeType,
} from "@/lib/graph/types";
import {
  getNeighbors,
  queryKnowledgeGraph,
} from "@/lib/intelligence/knowledge-graph-engine";

type GraphMode =
  | "collection"
  | "ecosystem"
  | "dna"
  | "discovery";

type Position = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
};

const modes: Array<{
  value: GraphMode;
  label: string;
}> = [
  { value: "collection", label: "Collection" },
  { value: "ecosystem", label: "Ecosystem" },
  { value: "dna", label: "Taste DNA" },
  { value: "discovery", label: "Discovery" },
];

const nodeTypes: KnowledgeNodeType[] = [
  "fragrance",
  "brand",
  "family",
  "dna",
  "role",
  "season",
  "perfumer",
  "note",
  "accord",
];

export function KnowledgeGraphCanvas({
  graph,
  selectedNodeId,
  comparisonNodeId,
  onSelectNode,
  onSelectComparisonNode,
}: {
  graph: KnowledgeGraph;
  selectedNodeId: string | null;
  comparisonNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectComparisonNode: (nodeId: string | null) => void;
}) {
  const [mode, setMode] =
    useState<GraphMode>("collection");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });
  const [search, setSearch] =
    useState("");
  const [fullScreen, setFullScreen] =
    useState(false);
  const [activeTypes, setActiveTypes] =
    useState<KnowledgeNodeType[]>([
      "fragrance",
      "brand",
      "family",
      "dna",
    ]);
  const [ownedOnly, setOwnedOnly] =
    useState(false);
  const [minimumStrength, setMinimumStrength] =
    useState(48);
  const [history, setHistory] = useState<
    string[]
  >([]);
  const [draggingNodeId, setDraggingNodeId] =
    useState<string | null>(null);
  const [positions, setPositions] =
    useState<Map<string, Position>>(
      new Map(),
    );

  const viewportRef =
    useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const visibleNodes = useMemo(
    () =>
      selectVisibleNodes({
        graph,
        mode,
        search,
        activeTypes,
        ownedOnly,
      }),
    [
      graph,
      mode,
      search,
      activeTypes,
      ownedOnly,
    ],
  );

  const visibleIds = useMemo(
    () =>
      new Set(
        visibleNodes.map((node) => node.id),
      ),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () =>
      graph.edges.filter(
        (edge) =>
          visibleIds.has(edge.source) &&
          visibleIds.has(edge.target) &&
          edge.strength >= minimumStrength,
      ),
    [
      graph.edges,
      minimumStrength,
      visibleIds,
    ],
  );

  useEffect(() => {
    setPositions((current) => {
      const next = new Map(current);
      const seeded = seedPositions(
        visibleNodes,
        940,
        620,
      );

      for (const node of visibleNodes) {
        if (!next.has(node.id)) {
          next.set(
            node.id,
            seeded.get(node.id)!,
          );
        }
      }

      for (const id of [...next.keys()]) {
        if (!visibleIds.has(id)) {
          next.delete(id);
        }
      }

      return next;
    });
  }, [visibleNodes, visibleIds]);

  useEffect(() => {
    let frame = 0;
    let active = true;

    const tick = () => {
      if (!active) return;

      setPositions((current) =>
        simulateStep({
          current,
          nodes: visibleNodes,
          edges: visibleEdges,
          width: 940,
          height: 620,
          frozenNodeId: draggingNodeId,
        }),
      );

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, [
    draggingNodeId,
    visibleEdges,
    visibleNodes,
  ]);

  const selectedNeighborhood =
    selectedNodeId
      ? new Set([
          selectedNodeId,
          ...getNeighbors(
            graph,
            selectedNodeId,
            0,
          ).map(
            (entry) => entry.node.id,
          ),
        ])
      : null;

  function handleSelect(nodeId: string) {
    if (
      selectedNodeId &&
      selectedNodeId !== nodeId
    ) {
      setHistory((current) => [
        ...current.slice(-8),
        selectedNodeId,
      ]);
    }
    onSelectNode(nodeId);
  }

  function handleBack() {
    const previous = history.at(-1);
    if (!previous) return;

    setHistory((current) =>
      current.slice(0, -1),
    );
    onSelectNode(previous);
  }

  function toggleType(
    type: KnowledgeNodeType,
  ) {
    setActiveTypes((current) =>
      current.includes(type)
        ? current.length === 1
          ? current
          : current.filter(
              (item) => item !== type,
            )
        : [...current, type],
    );
  }

  function startNodeDrag(
    nodeId: string,
    event:
      | React.MouseEvent<SVGGElement>
      | React.TouchEvent<SVGGElement>,
  ) {
    event.stopPropagation();
    setDraggingNodeId(nodeId);
    setPositions((current) => {
      const next = new Map(current);
      const position = next.get(nodeId);
      if (position) {
        next.set(nodeId, {
          ...position,
          fixed: true,
        });
      }
      return next;
    });
  }

  function movePointer(
    clientX: number,
    clientY: number,
  ) {
    const viewport =
      viewportRef.current;
    if (!viewport) return;

    const rect =
      viewport.getBoundingClientRect();

    if (draggingNodeId) {
      const x =
        (clientX - rect.left - pan.x) /
        zoom;
      const y =
        (clientY - rect.top - pan.y) /
        zoom;

      setPositions((current) => {
        const next = new Map(current);
        const existing =
          next.get(draggingNodeId);
        if (existing) {
          next.set(draggingNodeId, {
            ...existing,
            x,
            y,
            vx: 0,
            vy: 0,
            fixed: true,
          });
        }
        return next;
      });
      return;
    }

    if (panStateRef.current.active) {
      setPan({
        x:
          panStateRef.current.originX +
          clientX -
          panStateRef.current.startX,
        y:
          panStateRef.current.originY +
          clientY -
          panStateRef.current.startY,
      });
    }
  }

  function endPointer() {
    if (draggingNodeId) {
      setPositions((current) => {
        const next = new Map(current);
        const existing =
          next.get(draggingNodeId);
        if (existing) {
          next.set(draggingNodeId, {
            ...existing,
            fixed: false,
          });
        }
        return next;
      });
    }
    setDraggingNodeId(null);
    panStateRef.current.active = false;
  }

  function beginPan(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (
      (event.target as HTMLElement)
        .closest("[data-graph-node]")
    ) {
      return;
    }

    panStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPositions(
      seedPositions(
        visibleNodes,
        940,
        620,
      ),
    );
  }

  return (
    <section
      className={`graph-canvas-shell ${
        fullScreen ? "is-fullscreen" : ""
      }`}
    >
      <div className="graph-toolbar">
        <label className="graph-search-control">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search graph nodes"
          />
        </label>

        <label className="graph-mode-control">
          <select
            value={mode}
            onChange={(event) =>
              setMode(
                event.target
                  .value as GraphMode,
              )
            }
          >
            {modes.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>

        <div className="graph-zoom-controls">
          <button
            type="button"
            aria-label="Back selection"
            disabled={!history.length}
            onClick={handleBack}
          >
            <ArrowLeft size={15} />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setZoom((value) =>
                Math.max(
                  0.55,
                  value - 0.1,
                ),
              )
            }
          >
            <Minus size={15} />
          </button>
          <span>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setZoom((value) =>
                Math.min(
                  1.8,
                  value + 0.1,
                ),
              )
            }
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            aria-label="Reset view"
            onClick={resetView}
          >
            <Focus size={15} />
          </button>
          <button
            type="button"
            aria-label={
              fullScreen
                ? "Exit full screen"
                : "Enter full screen"
            }
            onClick={() =>
              setFullScreen((value) => !value)
            }
          >
            {fullScreen ? (
              <Shrink size={15} />
            ) : (
              <Expand size={15} />
            )}
          </button>
        </div>
      </div>

      <div className="graph-filter-row">
        <div className="graph-type-filters">
          {nodeTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={
                activeTypes.includes(type)
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                toggleType(type)
              }
            >
              {type}
            </button>
          ))}
        </div>

        <label className="graph-owned-toggle">
          <input
            type="checkbox"
            checked={ownedOnly}
            onChange={(event) =>
              setOwnedOnly(
                event.target.checked,
              )
            }
          />
          Owned only
        </label>

        <label className="graph-strength-control">
          <span>
            Strength {minimumStrength}+
          </span>
          <input
            type="range"
            min={30}
            max={90}
            value={minimumStrength}
            onChange={(event) =>
              setMinimumStrength(
                Number(
                  event.target.value,
                ),
              )
            }
          />
        </label>
      </div>

      <div
        ref={viewportRef}
        className="graph-viewport immersive"
        onMouseDown={beginPan}
        onMouseMove={(event) =>
          movePointer(
            event.clientX,
            event.clientY,
          )
        }
        onMouseUp={endPointer}
        onMouseLeave={endPointer}
        onTouchMove={(event) => {
          const touch =
            event.touches[0];
          if (touch) {
            movePointer(
              touch.clientX,
              touch.clientY,
            );
          }
        }}
        onTouchEnd={endPointer}
      >
        <svg
          viewBox="0 0 940 620"
          role="img"
          aria-label="Immersive OLFACTUS knowledge graph visualization"
          className="knowledge-graph-svg"
        >
          <defs>
            <radialGradient id="graphNodeGlow">
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity=".28"
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          <g
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin:
                "470px 310px",
            }}
          >
            {visibleEdges.map(
              (edge, index) => {
                const source =
                  positions.get(edge.source);
                const target =
                  positions.get(edge.target);

                if (!source || !target) {
                  return null;
                }

                const emphasized =
                  !selectedNeighborhood ||
                  (selectedNeighborhood.has(
                    edge.source,
                  ) &&
                    selectedNeighborhood.has(
                      edge.target,
                    ));

                const compared =
                  comparisonNodeId &&
                  selectedNodeId &&
                  [edge.source, edge.target].includes(
                    selectedNodeId,
                  ) &&
                  [edge.source, edge.target].includes(
                    comparisonNodeId,
                  );

                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className={`graph-edge ${
                        emphasized
                          ? "is-emphasized"
                          : "is-muted"
                      } ${
                        compared
                          ? "is-compared"
                          : ""
                      }`}
                      style={{
                        strokeWidth:
                          0.6 +
                          edge.strength / 45,
                      }}
                    />
                    {edge.strength >= 70 ? (
                      <circle
                        r="3"
                        className="graph-edge-particle"
                      >
                        <animateMotion
                          dur={`${4 + (index % 4)}s`}
                          repeatCount="indefinite"
                          path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                        />
                      </circle>
                    ) : null}
                  </g>
                );
              },
            )}

            {visibleNodes.map((node) => {
              const position =
                positions.get(node.id);
              if (!position) return null;

              const selected =
                node.id === selectedNodeId;
              const compared =
                node.id === comparisonNodeId;
              const emphasized =
                !selectedNeighborhood ||
                selectedNeighborhood.has(
                  node.id,
                );

              return (
                <g
                  key={node.id}
                  data-graph-node
                  className={`graph-node graph-node-${node.type} ${
                    selected
                      ? "is-selected"
                      : ""
                  } ${
                    compared
                      ? "is-compared"
                      : ""
                  } ${
                    emphasized
                      ? ""
                      : "is-muted"
                  }`}
                  transform={`translate(${position.x} ${position.y})`}
                  onMouseDown={(event) =>
                    startNodeDrag(
                      node.id,
                      event,
                    )
                  }
                  onTouchStart={(event) =>
                    startNodeDrag(
                      node.id,
                      event,
                    )
                  }
                  onDoubleClick={() =>
                    onSelectComparisonNode(
                      node.id ===
                        comparisonNodeId
                        ? null
                        : node.id,
                    )
                  }
                  onClick={() =>
                    handleSelect(node.id)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${node.label}`}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      handleSelect(node.id);
                    }
                  }}
                >
                  <circle
                    r={nodeRadius(node) + 10}
                    className="graph-node-halo"
                  />
                  <circle
                    r={nodeRadius(node)}
                    className="graph-node-glow"
                  />
                  <circle
                    r={
                      nodeRadius(node) * 0.58
                    }
                    className="graph-node-core"
                  />
                  <text
                    y={
                      nodeRadius(node) + 15
                    }
                    textAnchor="middle"
                    className="graph-node-label"
                  >
                    {truncate(
                      node.label,
                      18,
                    )}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <GraphMinimap
          nodes={visibleNodes}
          positions={positions}
          selectedNodeId={
            selectedNodeId
          }
        />

        <div className="graph-canvas-status">
          <Layers3 size={14} />
          {visibleNodes.length} nodes ·{" "}
          {visibleEdges.length} relationships
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        Drag nodes to reposition them. Drag empty
        space to pan. Double-click a second node
        to compare.
      </p>
    </section>
  );
}

function GraphMinimap({
  nodes,
  positions,
  selectedNodeId,
}: {
  nodes: KnowledgeGraphNode[];
  positions: Map<string, Position>;
  selectedNodeId: string | null;
}) {
  return (
    <div className="graph-minimap">
      <svg
        viewBox="0 0 940 620"
        aria-label="Graph minimap"
      >
        {nodes.map((node) => {
          const position =
            positions.get(node.id);
          if (!position) return null;

          return (
            <circle
              key={node.id}
              cx={position.x}
              cy={position.y}
              r={
                node.id ===
                selectedNodeId
                  ? 16
                  : 8
              }
              className={
                node.id ===
                selectedNodeId
                  ? "is-selected"
                  : ""
              }
            />
          );
        })}
      </svg>
    </div>
  );
}

function selectVisibleNodes({
  graph,
  mode,
  search,
  activeTypes,
  ownedOnly,
}: {
  graph: KnowledgeGraph;
  mode: GraphMode;
  search: string;
  activeTypes: KnowledgeNodeType[];
  ownedOnly: boolean;
}) {
  const searched = search.trim()
    ? queryKnowledgeGraph(graph, {
        text: search,
      })
    : graph.nodes;

  const allowed: Record<
    GraphMode,
    KnowledgeNodeType[]
  > = {
    collection: [
      "fragrance",
      "brand",
      "family",
      "dna",
      "role",
      "season",
    ],
    ecosystem: [
      "fragrance",
      "brand",
      "family",
      "role",
      "season",
      "dna",
      "perfumer",
      "note",
      "accord",
    ],
    dna: [
      "fragrance",
      "dna",
      "family",
      "role",
    ],
    discovery: [
      "fragrance",
      "family",
      "role",
      "dna",
      "brand",
    ],
  };

  return searched
    .filter((node) =>
      allowed[mode].includes(node.type),
    )
    .filter((node) =>
      activeTypes.includes(node.type),
    )
    .filter((node) => {
      if (
        ownedOnly &&
        node.type === "fragrance"
      ) {
        return node.owned;
      }

      if (mode === "collection") {
        return (
          node.type !== "fragrance" ||
          node.owned
        );
      }

      if (mode === "discovery") {
        return (
          node.type !== "fragrance" ||
          node.candidate
        );
      }

      return true;
    })
    .slice(0, 90);
}

function seedPositions(
  nodes: KnowledgeGraphNode[],
  width: number,
  height: number,
) {
  const center = {
    x: width / 2,
    y: height / 2,
  };
  const positions = new Map<
    string,
    Position
  >();

  nodes.forEach((node, index) => {
    const ring = Math.floor(index / 12);
    const ringIndex = index % 12;
    const ringCount = Math.min(
      12,
      Math.max(
        1,
        nodes.length - ring * 12,
      ),
    );
    const angle =
      (ringIndex / ringCount) *
        Math.PI *
        2 -
      Math.PI / 2;
    const radius =
      105 + ring * 82;

    positions.set(node.id, {
      x:
        center.x +
        Math.cos(angle) * radius,
      y:
        center.y +
        Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    });
  });

  return positions;
}

function simulateStep({
  current,
  nodes,
  edges,
  width,
  height,
  frozenNodeId,
}: {
  current: Map<string, Position>;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraph["edges"];
  width: number;
  height: number;
  frozenNodeId: string | null;
}) {
  const next = new Map(
    [...current.entries()].map(
      ([id, position]) => [
        id,
        { ...position },
      ],
    ),
  );

  const center = {
    x: width / 2,
    y: height / 2,
  };

  for (let i = 0; i < nodes.length; i += 1) {
    const first =
      next.get(nodes[i].id);
    if (!first) continue;

    for (
      let j = i + 1;
      j < nodes.length;
      j += 1
    ) {
      const second =
        next.get(nodes[j].id);
      if (!second) continue;

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.max(
        8,
        Math.sqrt(dx * dx + dy * dy),
      );
      const minimum =
        nodeRadius(nodes[i]) +
        nodeRadius(nodes[j]) +
        42;
      const force =
        distance < minimum
          ? (minimum - distance) * 0.004
          : 0.06 / distance;

      const fx =
        (dx / distance) * force;
      const fy =
        (dy / distance) * force;

      first.vx -= fx;
      first.vy -= fy;
      second.vx += fx;
      second.vy += fy;
    }
  }

  for (const edge of edges) {
    const source =
      next.get(edge.source);
    const target =
      next.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(
      1,
      Math.sqrt(dx * dx + dy * dy),
    );
    const targetDistance =
      110 +
      (100 - edge.strength) * 0.7;
    const force =
      (distance - targetDistance) *
      0.0009;

    const fx =
      (dx / distance) * force;
    const fy =
      (dy / distance) * force;

    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }

  for (const node of nodes) {
    const position =
      next.get(node.id);
    if (!position) continue;

    const centerForce = 0.0007;
    position.vx +=
      (center.x - position.x) *
      centerForce;
    position.vy +=
      (center.y - position.y) *
      centerForce;

    position.vx *= 0.91;
    position.vy *= 0.91;

    if (
      node.id !== frozenNodeId &&
      !position.fixed
    ) {
      position.x = clamp(
        position.x + position.vx,
        35,
        width - 35,
      );
      position.y = clamp(
        position.y + position.vy,
        35,
        height - 35,
      );
    }
  }

  return next;
}

function nodeRadius(
  node: KnowledgeGraphNode,
) {
  if (node.type === "fragrance") {
    return node.owned ? 26 : 22;
  }
  if (node.type === "dna") return 18;
  if (node.type === "brand") return 16;
  if (node.type === "family") return 15;
  return 12;
}

function truncate(
  value: string,
  maximum: number,
) {
  if (value.length <= maximum) {
    return value;
  }
  return `${value.slice(0, maximum - 1)}…`;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}
