"use client";

import { DiagramCanvasFillContext } from "@/components/tambo/diagram-canvas";
import {
  getLayoutedPositions,
  NODE_HEIGHT as LAYOUT_NODE_HEIGHT,
  NODE_WIDTH as LAYOUT_NODE_WIDTH,
} from "@/lib/flow-layout";
import { useSelectedNode } from "@/lib/selected-node-context";
import { InteractableNodeDetailsPanel } from "@/components/tambo/node-details-panel";
import { cn } from "@/lib/utils";
import { useTamboStreamStatus } from "@tambo-ai/react";

const DIAGRAM_PADDING = 80;
const MIN_DIAGRAM_HEIGHT = 280;
const MAX_DIAGRAM_HEIGHT = 700;
const HEADER_HEIGHT = 64;
import React, { useEffect, useRef } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import type { Edge, Node } from "reactflow";
import { z } from "zod/v3";

/**
 * Basic node schema for React Flow diagrams
 * This is purposely minimal so the AI only has to think about IDs, labels, and positions.
 */
export const flowNodeSchema = z.object({
  id: z.string().describe("Unique identifier for the node"),
  label: z.string().describe("Label shown inside the node"),
  type: z
    .enum(["input", "default", "output"])
    .optional()
    .describe("Visual variant of the node"),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .describe("Absolute canvas position for the node"),
});

/**
 * Basic edge schema for React Flow diagrams
 */
export const flowEdgeSchema = z.object({
  id: z.string().describe("Unique identifier for the edge"),
  source: z.string().describe("ID of the source node"),
  target: z.string().describe("ID of the target node"),
});

/**
 * Top-level schema for a flow diagram the AI can work with.
 */
export const flowDiagramSchema = z.object({
  title: z.string().describe("High-level name of the diagram"),
  description: z
    .string()
    .optional()
    .describe("Optional description of what this flow represents"),
  nodes: z
    .array(flowNodeSchema)
    .min(1)
    .describe("Nodes to render in the diagram"),
  edges: z
    .array(flowEdgeSchema)
    .describe("Edges connecting the nodes in the diagram"),
  height: z
    .number()
    .optional()
    .describe("Optional height in pixels (defaults to 480)"),
  className: z
    .string()
    .optional()
    .describe("Additional Tailwind classes for the outer container"),
});

export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowEdge = z.infer<typeof flowEdgeSchema>;
export type FlowDiagramProps = z.infer<typeof flowDiagramSchema>;

const FIT_VIEW_OPTS = {
  padding: 0.15,
  maxZoom: 1,
  duration: 250,
  includeHiddenNodes: false,
};

const PANEL_GAP = 12;

/** Renders the node details panel positioned beside the selected node (inside ReactFlowProvider). */
function NodeDetailsPanelOverlay() {
  const { selectedNode } = useSelectedNode();
  const { getViewport } = useReactFlow();
  const viewport = getViewport();
  if (!selectedNode) return null;
  const { flowPosition } = selectedNode;
  const left =
    viewport.x + flowPosition.x * viewport.zoom + LAYOUT_NODE_WIDTH + PANEL_GAP;
  const top = viewport.y + flowPosition.y * viewport.zoom;
  return (
    <div
      className="absolute z-10 pointer-events-auto"
      style={{ left, top }}
      aria-label="Node details"
    >
      <InteractableNodeDetailsPanel
        key={selectedNode.id}
        interactableId={`node-details-${selectedNode.id}`}
        nodeId={selectedNode.id}
        nodeLabel={selectedNode.label}
        description=""
        suggestions={[]}
      />
    </div>
  );
}

/** Keeps the diagram fitted and centered: on load, after delays (for layout), and on window resize. */
function FitViewOnLoad({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow();
  const runFit = React.useCallback(() => {
    fitView(FIT_VIEW_OPTS);
  }, [fitView]);

  React.useEffect(() => {
    runFit();
    const t1 = setTimeout(runFit, 100);
    const t2 = setTimeout(runFit, 400);
    const t3 = nodeCount > 6 ? setTimeout(runFit, 800) : undefined;
    window.addEventListener("resize", runFit);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
      window.removeEventListener("resize", runFit);
    };
  }, [runFit, nodeCount]);
  return null;
}

/** Loading skeleton shown while diagram props are streaming and no nodes yet. */
function DiagramStreamingSkeleton() {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-6"
      aria-busy="true"
      aria-label="Building diagram"
    >
      <p className="text-sm text-muted-foreground animate-pulse">
        Building diagram…
      </p>
    </div>
  );
}

/**
 * FlowDiagram
 *
 * A thin, Tambo-friendly wrapper around React Flow that renders
 * static high-level architecture / system diagrams.
 *
 * The AI only needs to provide `nodes` and `edges`. We take care of
 * mapping `label` -> React Flow `data.label` and wiring up basic chrome.
 */
export function FlowDiagram({
  title,
  description,
  nodes: nodesProp,
  edges: edgesProp,
  height,
  className,
}: FlowDiagramProps) {
  const fillContainer = React.useContext(DiagramCanvasFillContext);
  const { setSelectedNode } = useSelectedNode();
  const safeNodes = Array.isArray(nodesProp) ? nodesProp : [];
  const safeEdges = Array.isArray(edgesProp) ? edgesProp : [];

  // Use id + index so every node has a unique key (avoids duplicate key warning)
  const { flowNodes, flowEdgesComputed } = React.useMemo(() => {
    const ids = safeNodes.map((n, i) => `${String(n.id)}-${i}`);
    const idFor = (raw: string) =>
      ids[safeNodes.findIndex((n) => n.id === raw)] ?? raw;

    const layoutPositions = getLayoutedPositions(
      ids,
      safeEdges.map((e) => ({
        source: idFor(e.source),
        target: idFor(e.target),
      })),
      "TB"
    );

    const nodes: Node[] = safeNodes.map((node, i) => {
      const pos = layoutPositions.get(ids[i]);
      const x =
        pos?.x != null && Number.isFinite(pos.x)
          ? pos.x
          : node.position?.x ?? i * 200;
      const y =
        pos?.y != null && Number.isFinite(pos.y)
          ? pos.y
          : node.position?.y ?? 50;
      return {
        id: ids[i],
        type: node.type,
        position: { x: Number(x), y: Number(y) },
        data: { label: node.label },
      };
    });

    const edges: Edge[] = safeEdges.map((e, i) => ({
      id: `e-${i}`,
      source: idFor(e.source),
      target: idFor(e.target),
    }));

    return { flowNodes: nodes, flowEdgesComputed: edges };
  }, [safeNodes, safeEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdgesComputed);

  const diagramKeyRef = useRef<string>("");
  const diagramKey =
    safeNodes.length +
    "|" +
    safeEdges.length +
    "|" +
    safeNodes.map((n) => n.id).join(",");
  useEffect(() => {
    if (diagramKeyRef.current === diagramKey) return;
    diagramKeyRef.current = diagramKey;
    setNodes(flowNodes);
    setEdges(flowEdgesComputed);
    // Only re-sync when diagram identity changes (stable key), not on every parent re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramKey]);

  const diagramHeight = React.useMemo(() => {
    if (nodes.length === 0) return MIN_DIAGRAM_HEIGHT;
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxY = Math.max(
      ...nodes.map((n) => n.position.y + LAYOUT_NODE_HEIGHT)
    );
    const h = maxY - minY + DIAGRAM_PADDING;
    return Math.max(
      MIN_DIAGRAM_HEIGHT,
      Math.min(MAX_DIAGRAM_HEIGHT, Math.ceil(h))
    );
  }, [nodes]);

  const resolvedHeight = fillContainer
    ? undefined
    : height != null
    ? height
    : HEADER_HEIGHT + diagramHeight;

  return (
    <div
      className={cn(
        "w-full flex flex-col overflow-hidden",
        !fillContainer &&
          "rounded-lg border bg-card text-card-foreground shadow-sm",
        fillContainer ? "h-full" : "",
        className
      )}
      style={
        fillContainer
          ? { height: "100%" }
          : resolvedHeight != null
          ? { height: resolvedHeight }
          : { height: "100%" }
      }
    >
      {!fillContainer && (
        <div className="border-b px-4 py-2 flex flex-col gap-1 bg-muted/40 shrink-0">
          <h3 className="text-sm font-medium leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex-1 min-h-0 w-full relative",
          fillContainer && "h-full min-h-[50vh] overflow-hidden"
        )}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_event, node) =>
              setSelectedNode({
                id: node.id,
                label:
                  (node.data as { label?: string } | undefined)?.label ?? node.id,
                flowPosition: { x: node.position.x, y: node.position.y },
              })
            }
            onPaneClick={() => setSelectedNode(null)}
            onInit={(instance) => instance.fitView(FIT_VIEW_OPTS)}
            fitView
            fitViewOptions={FIT_VIEW_OPTS}
            minZoom={0.01}
            maxZoom={1}
            nodesDraggable
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <FitViewOnLoad nodeCount={nodes.length} />
            <MiniMap
              nodeStrokeColor="var(--muted-foreground)"
              nodeColor="var(--muted)"
              maskColor="rgba(0,0,0,0.05)"
            />
            <Controls />
          </ReactFlow>
          <NodeDetailsPanelOverlay />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

/**
 * FlowDiagram with streaming support for the right panel.
 * Uses useTamboStreamStatus; must only be rendered inside TamboMessageProvider
 * (i.e. as the registered FlowDiagram component in the thread).
 * Shows a loading skeleton while props are streaming and no nodes yet.
 */
export function FlowDiagramWithStreaming(props: FlowDiagramProps) {
  const { streamStatus } = useTamboStreamStatus<FlowDiagramProps>();
  const safeNodes = Array.isArray(props.nodes) ? props.nodes : [];
  const showLoading =
    (streamStatus.isPending || streamStatus.isStreaming) &&
    safeNodes.length === 0;

  if (showLoading) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <DiagramStreamingSkeleton />
      </div>
    );
  }

  return <FlowDiagram {...props} />;
}
