"use client";

import { useTambo } from "@tambo-ai/react";
import * as React from "react";
import { FlowDiagram } from "@/components/tambo/flow-diagram";

export const DiagramCanvasFillContext = React.createContext(false);

/** Sample welcome diagram shown on start when no diagram has been generated yet. */
const WELCOME_DIAGRAM = {
  title: "Welcome",
  description: "Describe your diagram in the chat to generate a new one.",
  nodes: [
    {
      id: "start",
      label: "Start",
      type: "input" as const,
      position: { x: 0, y: 0 },
    },
    { id: "describe", label: "Describe your idea", position: { x: 0, y: 0 } },
    { id: "generate", label: "Generate diagram", position: { x: 0, y: 0 } },
    {
      id: "view",
      label: "View result",
      type: "output" as const,
      position: { x: 0, y: 0 },
    },
  ],
  edges: [
    { id: "e1", source: "start", target: "describe" },
    { id: "e2", source: "describe", target: "generate" },
    { id: "e3", source: "generate", target: "view" },
  ],
};

/**
 * Right-panel canvas that shows the latest diagram (rendered component) from the thread.
 * Uses full width/height of the right panel; diagram fits in view and is centered.
 * Shows a welcome diagram when no diagram has been generated yet.
 */
/** Loading skeleton for right panel when thread is streaming and no diagram yet. */
function RightPanelStreamingSkeleton() {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-6"
      aria-busy="true"
      aria-label="Generating diagram"
    >
      <p className="text-sm text-muted-foreground animate-pulse">
        Generating diagram…
      </p>
    </div>
  );
}

interface DiagramCanvasProps {
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export function DiagramCanvas({ canvasRef }: DiagramCanvasProps) {
  const { thread, streaming } = useTambo();
  const messages = thread?.messages ?? [];

  const latestDiagram = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (
        msg?.role === "assistant" &&
        msg.renderedComponent &&
        !msg.isCancelled
      ) {
        return msg.renderedComponent;
      }
    }
    return null;
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const isStreamingFlowDiagram =
    streaming &&
    lastMessage?.role === "assistant" &&
    (lastMessage as { component?: { componentName?: string } })?.component
      ?.componentName === "FlowDiagram";
  const showStreamingSkeleton =
    isStreamingFlowDiagram && !latestDiagram && messages.length > 0;

  return (
    <div
      data-canvas-space="true"
      className="flex-1 flex flex-col min-w-0 h-full overflow-hidden diagram-canvas"
      aria-label="Diagram canvas"
    >
      <DiagramCanvasFillContext.Provider value={true}>
        <div
          ref={canvasRef}
          className="flex-1 min-h-0 w-full flex flex-col diagram-canvas-dotted"
        >
          {showStreamingSkeleton ? (
            <RightPanelStreamingSkeleton />
          ) : latestDiagram ? (
            latestDiagram
          ) : (
            <FlowDiagram
              title={WELCOME_DIAGRAM.title}
              description={WELCOME_DIAGRAM.description}
              nodes={WELCOME_DIAGRAM.nodes}
              edges={WELCOME_DIAGRAM.edges}
            />
          )}
        </div>
      </DiagramCanvasFillContext.Provider>
    </div>
  );
}
