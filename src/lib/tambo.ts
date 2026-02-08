/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import {
  FlowDiagramWithStreaming,
  flowDiagramSchema,
} from "@/components/tambo/flow-diagram";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import { ENHANCEMENTS, SAMPLE_FLOWS } from "@/services/react-flow";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

// Shared schemas for React Flow-based tools
const reactFlowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["input", "default", "output"]).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const reactFlowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

const reactFlowDiagramSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  nodes: z.array(reactFlowNodeSchema),
  edges: z.array(reactFlowEdgeSchema),
});

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "generateFlow",
    description:
      "Generates a React Flow visualization for a given process or system",
    tool: async ({ topic }: { topic: string }) => {
      const normalizedTopic = topic.toLowerCase();

      // Use sample flow when we have a known match (saves API cost and latency)
      const matchingFlow = Object.entries(SAMPLE_FLOWS).find(
        ([key]) =>
          normalizedTopic.includes(key.split(" ")[0]) ||
          key.includes(normalizedTopic.split(" ")[0]),
      );

      if (matchingFlow) {
        const [title, flow] = matchingFlow;
        return {
          title,
          description: `High-level ${title} flow showing the main stages involved.`,
          nodes: flow.nodes,
          edges: flow.edges,
        };
      }

      // Try OpenAI via API route for unknown topics
      try {
        const res = await fetch("/api/generate-flow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });
        if (res.ok) {
          const data = await res.json();

          console.log("data", data);

          if (
            data &&
            Array.isArray(data.nodes) &&
            data.nodes.length > 0 &&
            Array.isArray(data.edges)
          ) {
            return {
              title: data.title ?? topic,
              description: data.description,
              nodes: data.nodes,
              edges: data.edges,
            };
          }
        }
      } catch {
        // Fall through to generic fallback
      }

      // Fallback: generic 3-node flow when API is unavailable or invalid
      return {
        title: topic,
        description: `A basic high-level flow for ${topic}. You can ask to enhance it with error handling, security, or monitoring.`,
        nodes: [
          { id: "1", label: "Start", type: "input", position: { x: 0, y: 50 } },
          {
            id: "2",
            label: "Process",
            type: "default",
            position: { x: 200, y: 50 },
          },
          {
            id: "3",
            label: "End",
            type: "output",
            position: { x: 400, y: 50 },
          },
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
        ],
      };
    },
    inputSchema: z.object({
      topic: z.string(),
    }),
    outputSchema: reactFlowDiagramSchema,
  },
  {
    name: "enhanceFlow",
    description: "Adds enhancement nodes and edges to an existing flow",
    tool: async ({
      enhancementType,
      currentNodes,
      currentEdges,
    }: {
      enhancementType: string;
      currentNodes: z.infer<typeof reactFlowNodeSchema>[];
      currentEdges: z.infer<typeof reactFlowEdgeSchema>[];
    }) => {
      const enhancement =
        ENHANCEMENTS[enhancementType as keyof typeof ENHANCEMENTS];

      // Always work with safe arrays to avoid runtime errors
      const safeCurrentNodes = Array.isArray(currentNodes)
        ? currentNodes.filter(
            (n) =>
              n &&
              n.position &&
              typeof n.position.y === "number" &&
              typeof n.position.x === "number",
          )
        : [];
      const safeCurrentEdges = Array.isArray(currentEdges) ? currentEdges : [];

      if (!enhancement) {
        return {
          title: "Flow enhancement",
          description: `No enhancement preset found for "${enhancementType}". The original flow is returned unchanged.`,
          nodes: safeCurrentNodes,
          edges: safeCurrentEdges,
        };
      }

      // Place enhancement nodes roughly below the existing diagram
      const maxY =
        safeCurrentNodes.length > 0
          ? Math.max(...safeCurrentNodes.map((n) => n.position.y))
          : 0;

      const positionedNewNodes = enhancement.nodes.map((node, index) => ({
        id: node.id,
        label: node.label,
        type: node.type ?? "default",
        position: {
          x: index * 200,
          y: maxY + 150,
        },
      }));

      return {
        title: "Flow enhancement",
        description: `Added ${enhancementType.replace(
          /_/g,
          " ",
        )} to your flow.`,
        nodes: [...safeCurrentNodes, ...positionedNewNodes],
        edges: [...safeCurrentEdges, ...enhancement.edges],
      };
    },
    inputSchema: z.object({
      enhancementType: z
        .enum(["add_error_handling", "add_security", "add_monitoring"])
        .describe(
          "Type of enhancement to add (error handling, security, or monitoring)",
        ),
      currentNodes: z
        .array(reactFlowNodeSchema)
        .describe("Current nodes in the diagram to be enhanced"),
      currentEdges: z
        .array(reactFlowEdgeSchema)
        .describe("Current edges in the diagram to be enhanced"),
    }),
    outputSchema: reactFlowDiagramSchema,
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "FlowDiagram",
    description:
      "A React Flow–based diagram component for visualizing high-level architecture and system flows, with support for AI-driven generation and enhancements.",
    component: FlowDiagramWithStreaming,
    propsSchema: flowDiagramSchema,
  },
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
];
