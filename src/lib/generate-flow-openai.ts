/**
 * Converts OpenAI flow response to React Flow–compatible nodes/edges.
 * Assigns positions (horizontal layout) if missing and validates with Zod.
 */

import { z } from "zod";

const reactFlowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["input", "default", "output"]).optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

const reactFlowEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
});

const reactFlowDiagramSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  nodes: z.array(reactFlowNodeSchema),
  edges: z.array(reactFlowEdgeSchema),
});

export type ReactFlowNode = z.infer<typeof reactFlowNodeSchema> & {
  position: { x: number; y: number };
};
export type ReactFlowEdge = { id: string; source: string; target: string };
export type ReactFlowDiagram = {
  title: string;
  description?: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
};

const NODE_SPACING_X = 200;
const NODE_Y = 50;

/**
 * Ensures every node has position; first node is "input", last is "output", rest "default".
 * Builds edge ids if missing.
 */
export function toReactFlowDiagram(raw: unknown): ReactFlowDiagram | null {
  const parsed = reactFlowDiagramSchema.safeParse(raw);
  if (!parsed.success) return null;

  const { title, description, nodes, edges } = parsed.data;
  if (nodes.length === 0) return null;

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  const nodesWithPosition: ReactFlowNode[] = nodes.map((node, i) => {
    const position =
      node.position && typeof node.position.x === "number"
        ? node.position
        : { x: i * NODE_SPACING_X, y: NODE_Y };
    const type =
      node.type && ["input", "default", "output"].includes(node.type)
        ? node.type
        : i === 0
        ? "input"
        : i === nodes.length - 1
        ? "output"
        : "default";
    return {
      id: node.id,
      label: node.label,
      type,
      position,
    };
  });

  const edgesWithIds: ReactFlowEdge[] = validEdges.map((e, i) => ({
    id: e.id && e.id.trim() ? e.id : `e-${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
  }));

  return {
    title,
    description,
    nodes: nodesWithPosition,
    edges: edgesWithIds,
  };
}
