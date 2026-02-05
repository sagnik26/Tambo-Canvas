 "use client";

import { FlowDiagram } from "@/components/tambo/flow-diagram";

const TEST_NODES = [
  { id: "1", label: "Start", type: "input" as const, position: { x: 0, y: 50 } },
  {
    id: "2",
    label: "Build",
    type: "default" as const,
    position: { x: 200, y: 50 },
  },
  {
    id: "3",
    label: "Test",
    type: "default" as const,
    position: { x: 400, y: 50 },
  },
  {
    id: "4",
    label: "Deploy",
    type: "output" as const,
    position: { x: 600, y: 50 },
  },
];

const TEST_EDGES = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
];

export default function TestFlowPage() {
  return (
    <div className="h-screen w-full p-8 bg-background">
      <FlowDiagram
        title="Test CI/CD Flow"
        description="Static test diagram rendered directly from Next.js, without Tambo."
        nodes={TEST_NODES}
        edges={TEST_EDGES}
        height={500}
      />
    </div>
  );
}

