/**
 * Helpers for getting the current diagram from the thread and building a text summary.
 * Used by the Summarize button in the chat UI.
 */

type NodeLike = {
  id?: string;
  label?: string;
  type?: string;
  position?: { x: number; y: number };
  data?: { label?: string };
};

type EdgeLike = { id?: string; source: string; target: string };

function getNodeLabel(node: NodeLike, index: number): string {
  const raw =
    node.label ?? node.data?.label ?? `Step ${index + 1}`;
  return String(raw).trim() || `Step ${index + 1}`;
}

/** Infer architecture type and how it works from structure and labels. */
function analyzeArchitecture(
  nodes: NodeLike[],
  edges: EdgeLike[],
  getLabel: (node: NodeLike, i: number) => string,
): string {
  if (nodes.length === 0) return "";
  const allText = nodes
    .map((n, i) => getLabel(n, i))
    .join(" ")
    .toLowerCase();
  const idToIndex = new Map<string, number>();
  nodes.forEach((n, i) => {
    const id = n.id != null && String(n.id).trim() !== "" ? String(n.id) : `_i${i}`;
    if (!idToIndex.has(id)) idToIndex.set(id, i);
  });
  nodes.forEach((_, i) => {
    if (!idToIndex.has(`_i${i}`)) idToIndex.set(`_i${i}`, i);
  });
  const outDegree = new Map<number, number>();
  const inDegree = new Map<number, number>();
  nodes.forEach((_, i) => {
    outDegree.set(i, 0);
    inDegree.set(i, 0);
  });
  edges.forEach((e) => {
    const si = idToIndex.get(e.source) ?? (Number.isFinite(Number(e.source)) ? Number(e.source) : undefined);
    const ti = idToIndex.get(e.target) ?? (Number.isFinite(Number(e.target)) ? Number(e.target) : undefined);
    if (si !== undefined && ti !== undefined && si < nodes.length && ti < nodes.length) {
      outDegree.set(si, (outDegree.get(si) ?? 0) + 1);
      inDegree.set(ti, (inDegree.get(ti) ?? 0) + 1);
    }
  });
  const numSources = [...inDegree.values()].filter((d) => d === 0).length;
  const numSinks = [...outDegree.values()].filter((d) => d === 0).length;
  const maxOut = Math.max(...outDegree.values(), 0);
  const isLinear = maxOut <= 1 && numSources <= 1 && numSinks <= 1;
  const isPipeline =
    /build|deploy|ci|cd|pipeline|stage|test|release|artifact/.test(allText);
  const isAuth =
    /auth|login|token|session|oauth|sso|identity|credential/.test(allText);
  const isApi =
    /api|request|response|client|server|gateway|service/.test(allText);
  const isData =
    /data|database|queue|stream|event|message|process/.test(allText);

  const parts: string[] = [];
  if (isPipeline) {
    parts.push(
      "This describes a pipeline or staged workflow: work progresses through ordered phases, with each stage typically depending on the previous.",
    );
  } else if (isAuth) {
    parts.push(
      "This describes an authentication or identity flow: the system coordinates between user, identity provider, and application to establish and verify access.",
    );
  } else if (isApi) {
    parts.push(
      "This describes a request–response or service-oriented flow: components (clients, gateways, services) exchange calls or events along defined paths.",
    );
  } else if (isData) {
    parts.push(
      "This describes a data or event flow: information or events move through processing steps, queues, or services.",
    );
  } else {
    parts.push(
      "This describes a process or workflow: the system moves through a set of stages from entry to outcome.",
    );
  }
  if (isLinear) {
    parts.push(
      "The architecture is sequential—one path from start to end—so it behaves like a linear pipeline or lifecycle.",
    );
  } else if (maxOut > 1 || numSources > 1) {
    parts.push(
      "The flow branches or has multiple entry points, so behavior can vary by path or trigger.",
    );
  }
  return parts.join(" ");
}

export function getDiagramSummary(
  nodes: NodeLike[],
  edges: EdgeLike[],
  options?: { title?: string; description?: string },
): string {
  if (nodes.length === 0) return "Empty diagram (no steps).";

  const lines: string[] = [];

  if (options?.title?.trim()) {
    lines.push(`Diagram: ${options.title.trim()}`);
    lines.push("");
  }

  if (options?.description?.trim()) {
    lines.push("What it does");
    lines.push(options.description.trim());
    lines.push("");
  }

  const analysis = analyzeArchitecture(nodes, edges, getNodeLabel);
  lines.push("Architecture");
  lines.push(analysis);
  lines.push("");

  const intro = `Steps (${nodes.length}):`;
  lines.push(intro);
  lines.push("");

  const bullets = nodes.map((node, i) => {
    const label = getNodeLabel(node, i);
    const role =
      node.type === "input"
        ? " (start)"
        : node.type === "output"
          ? " (end)"
          : "";
    return `• ${label}${role}`;
  });
  lines.push(bullets.join("\n"));
  return lines.join("\n");
}

const WELCOME_DIAGRAM = {
  title: "Welcome",
  description: "Describe your diagram in the chat to generate a new one.",
  nodes: [
    { id: "start", label: "Start", type: "input", position: { x: 0, y: 0 } },
    { id: "describe", label: "Describe your idea", position: { x: 0, y: 0 } },
    { id: "generate", label: "Generate diagram", position: { x: 0, y: 0 } },
    { id: "view", label: "View result", type: "output", position: { x: 0, y: 0 } },
  ],
  edges: [
    { id: "e1", source: "start", target: "describe" },
    { id: "e2", source: "describe", target: "generate" },
    { id: "e3", source: "generate", target: "view" },
  ],
};

/** Message shape from Tambo thread: component has props (nodes, edges, title, description). */
type TamboMessage = {
  role?: string;
  component?: {
    componentName?: string | null;
    /** FlowDiagram props are stored here by the SDK (not in toolCallRequest). */
    props?: Record<string, unknown>;
  };
};

/** Accepts the thread from useTambo() (TamboThread from SDK). */
type TamboThreadLike = { messages?: TamboMessage[] };

/**
 * Returns nodes, edges, title, and description from the latest FlowDiagram in the thread, or the welcome diagram if none.
 */
export function getLatestDiagramData(thread: TamboThreadLike | null | undefined): {
  nodes: NodeLike[];
  edges: EdgeLike[];
  title?: string;
  description?: string;
} {
  const messages = thread?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const comp = msg?.component;
    if (
      msg?.role === "assistant" &&
      (comp?.componentName ?? undefined) === "FlowDiagram" &&
      comp?.props
    ) {
      const props = comp.props as Record<string, unknown>;
      const nodes = Array.isArray(props.nodes) ? (props.nodes as NodeLike[]) : [];
      const edges = Array.isArray(props.edges) ? (props.edges as EdgeLike[]) : [];
      if (nodes.length > 0) {
        const title = typeof props.title === "string" ? props.title : undefined;
        const description = typeof props.description === "string" ? props.description : undefined;
        return { nodes, edges, title, description };
      }
    }
  }
  return {
    nodes: WELCOME_DIAGRAM.nodes,
    edges: WELCOME_DIAGRAM.edges,
    title: WELCOME_DIAGRAM.title,
    description: WELCOME_DIAGRAM.description,
  };
}
