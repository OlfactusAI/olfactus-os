const selectedKey =
  "olfactus.graph.selected-node.v1";
const comparisonKey =
  "olfactus.graph.comparison-node.v1";

export function loadGraphSelection() {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      selectedNodeId:
        null as string | null,
      comparisonNodeId:
        null as string | null,
    };
  }

  return {
    selectedNodeId:
      window.localStorage.getItem(
        selectedKey,
      ),
    comparisonNodeId:
      window.localStorage.getItem(
        comparisonKey,
      ),
  };
}

export function saveGraphSelection({
  selectedNodeId,
  comparisonNodeId,
}: {
  selectedNodeId:
    string | null;
  comparisonNodeId:
    string | null;
}) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  if (selectedNodeId) {
    window.localStorage.setItem(
      selectedKey,
      selectedNodeId,
    );
  } else {
    window.localStorage.removeItem(
      selectedKey,
    );
  }

  if (comparisonNodeId) {
    window.localStorage.setItem(
      comparisonKey,
      comparisonNodeId,
    );
  } else {
    window.localStorage.removeItem(
      comparisonKey,
    );
  }
}
