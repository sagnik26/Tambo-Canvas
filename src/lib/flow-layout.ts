/**
 * Auto-layout for flow diagrams.
 * Computes node positions from graph structure (nodes + edges) so layout is consistent.
 * Pure JS implementation (no dagre) so it works in both server and client bundles.
 */

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 40;
/** Vertical gap between ranks (TB). Reduced so large diagrams stay in frame. */
const RANK_SEP_BASE = 56;
/** Horizontal gap between nodes in same rank. Must be >= NODE_WIDTH to avoid overlap. */
const SAME_RANK_SEP_BASE = NODE_WIDTH + 20;

export type LayoutDirection = "LR" | "TB" | "RL" | "BT";

/**
 * Assigns each node a rank (level) based on edges. Uses BFS from nodes with no incoming edges.
 * For cycles, falls back to order in nodeIds.
 */
function assignRanks(
  nodeIds: string[],
  edges: { source: string; target: string }[]
): Map<string, number> {
  const idToIndex = new Map(nodeIds.map((id, i) => [id, i]));
  const outEdges = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodeIds.forEach((id) => {
    outEdges.set(id, []);
    inDegree.set(id, 0);
  });

  edges.forEach((e) => {
    if (
      idToIndex.has(e.source) &&
      idToIndex.has(e.target) &&
      e.source !== e.target
    ) {
      outEdges.get(e.source)!.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    }
  });

  const rank = new Map<string, number>();
  const queue: { id: string; r: number }[] = [];

  nodeIds.forEach((id) => {
    if (inDegree.get(id) === 0) queue.push({ id, r: 0 });
  });

  if (queue.length === 0) {
    nodeIds.forEach((id, i) => rank.set(id, i));
    return rank;
  }

  while (queue.length > 0) {
    const { id, r } = queue.shift()!;
    if (rank.has(id)) continue;
    rank.set(id, r);
    for (const w of outEdges.get(id) ?? []) {
      const d = (inDegree.get(w) ?? 0) - 1;
      inDegree.set(w, d);
      if (d === 0) queue.push({ id: w, r: r + 1 });
    }
  }

  let maxRank = rank.size > 0 ? Math.max(...rank.values()) : -1;
  nodeIds.forEach((id) => {
    if (!rank.has(id)) rank.set(id, ++maxRank);
  });

  return rank;
}

/**
 * Returns node positions keyed by node id. Left-to-right hierarchical layout.
 * Uses compact spacing so diagrams with many nodes stay in frame when fitView is applied.
 */
export function getLayoutedPositions(
  nodeIds: string[],
  edges: { source: string; target: string }[],
  direction: LayoutDirection = "LR"
): Map<string, { x: number; y: number }> {
  const rankMap = assignRanks(nodeIds, edges);
  const byRank = new Map<number, string[]>();

  nodeIds.forEach((id) => {
    const r = rankMap.get(id) ?? 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(id);
  });

  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const totalNodes = nodeIds.length;
  // Tighter spacing when many nodes so the diagram fits in view; never below NODE_WIDTH to avoid overlap
  const rankSep = totalNodes > 12 ? 44 : totalNodes > 8 ? 50 : RANK_SEP_BASE;
  const sameRankSep =
    totalNodes > 12
      ? NODE_WIDTH + 12
      : totalNodes > 8
      ? NODE_WIDTH + 16
      : SAME_RANK_SEP_BASE;
  const positions = new Map<string, { x: number; y: number }>();

  ranks.forEach((rankVal, rankIndex) => {
    const ids = byRank.get(rankVal)!;
    const totalSpan = (ids.length - 1) * sameRankSep + NODE_HEIGHT;
    const start = -totalSpan / 2 + NODE_HEIGHT / 2;

    ids.forEach((id, i) => {
      const x = rankIndex * (NODE_WIDTH + rankSep);
      const y = start + i * sameRankSep;

      positions.set(id, { x, y });
    });
  });

  if (direction === "TB" || direction === "BT" || direction === "RL") {
    positions.forEach((pos, id) => {
      const [nx, ny] =
        direction === "TB"
          ? [pos.y, pos.x]
          : direction === "BT"
          ? [-pos.y, pos.x]
          : [-pos.x, pos.y];
      positions.set(id, { x: nx, y: ny });
    });
  }

  // Center the whole diagram at (0,0) so fitView keeps it centered in the viewport
  const xs = [...positions.values()].map((p) => p.x);
  const ys = [...positions.values()].map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs) + NODE_WIDTH;
  const maxY = Math.max(...ys) + NODE_HEIGHT;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  positions.forEach((pos, id) => {
    positions.set(id, { x: pos.x - cx, y: pos.y - cy });
  });

  return positions;
}
