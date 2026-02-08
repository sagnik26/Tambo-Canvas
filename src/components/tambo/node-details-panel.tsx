"use client";

import { withInteractable } from "@tambo-ai/react";
import { z } from "zod";

export const nodeDetailsPanelSchema = z.object({
  nodeId: z.string().describe("ID of the selected flow diagram node"),
  nodeLabel: z.string().describe("Label of the selected node"),
  description: z
    .string()
    .optional()
    .describe("AI-provided description or explanation of the node"),
  suggestions: z
    .array(z.string())
    .optional()
    .describe("AI-provided suggestions or next steps for this node"),
});

export type NodeDetailsPanelProps = z.infer<typeof nodeDetailsPanelSchema>;

function NodeDetailsPanelBase({
  nodeId,
  nodeLabel,
  description,
  suggestions = [],
}: NodeDetailsPanelProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-border bg-card text-card-foreground shadow-sm p-4 min-w-[240px] max-w-[320px]"
      data-node-details-panel="true"
    >
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
        Node details
      </h3>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Node: </span>
          <span className="font-medium" title={nodeId}>
            {nodeLabel || nodeId}
          </span>
        </div>
        {description != null && description !== "" && (
          <p className="text-muted-foreground leading-snug">{description}</p>
        )}
        {suggestions.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
        {(!description || description === "") && suggestions.length === 0 && (
          <p className="text-muted-foreground/80 text-xs italic">
            Ask the AI to describe this node or add suggestions.
          </p>
        )}
      </div>
    </div>
  );
}

export const InteractableNodeDetailsPanel = withInteractable(
  NodeDetailsPanelBase,
  {
    componentName: "NodeDetailsPanel",
    description:
      "Panel showing details for the selected flow diagram node. The AI can populate description and suggestions for the currently selected node.",
    propsSchema: nodeDetailsPanelSchema,
  }
);
