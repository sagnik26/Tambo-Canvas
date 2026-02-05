# TamboFlow

A Next.js diagramming app powered by **Tambo AI**: chat on the left, flow diagrams on the right. Users describe a diagram in natural language; the AI generates or updates React Flow diagrams via tools and generative/interactable components.

---

## Quick start

```bash
npm install
cp example.env.local .env.local   # Add NEXT_PUBLIC_TAMBO_API_KEY, OPENAI_API_KEY (optional, for generate-flow)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default theme is **dark**.

---

## Architecture (for Cursor / context)

### Tech stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Tambo AI** (`@tambo-ai/react`) – generative UI, tools, interactables
- **React Flow** (`reactflow`) – diagram nodes/edges, layout, controls
- **Tailwind CSS v4** – theme variables, dark mode, dotted canvas
- **Zod** – schemas for components and tools

### Layout

- **Left panel**: Chat thread (`MessageThreadFull`), message suggestions, input (textarea + single submit button; no file/MCP/dictation in toolbar).
- **Right panel**: Diagram canvas (`DiagramCanvas`). Shows either the **latest AI-generated diagram** from the thread or a **welcome diagram** (suggestion titles as nodes). Full height, dotted background, fit-to-view.
- **Top right**: Theme toggle (dark/light), persisted in `localStorage` (`tamboflow-theme`).

### Key files (where to look)

| Purpose                                                     | Path                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Tambo config** (components + tools)                       | `src/lib/tambo.ts`                                                          |
| **Main page** (chat + canvas + theme toggle)                | `src/app/page.tsx`                                                          |
| **Diagram canvas** (right panel, welcome vs latest diagram) | `src/components/tambo/diagram-canvas.tsx`                                   |
| **Flow diagram** (React Flow wrapper, layout, fit view)     | `src/components/tambo/flow-diagram.tsx`                                     |
| **Interactable diagram** (Tambo can update props)           | `flow-diagram.tsx` → `InteractableFlowDiagram`                              |
| **Chat thread + input + suggestions**                       | `src/components/tambo/message-thread-full.tsx`                              |
| **Theme** (dark default, toggle, script)                    | `src/lib/theme.ts`, `src/app/layout.tsx`, `src/components/theme-toggle.tsx` |
| **Global styles** (dotted canvas, dark diagram nodes/edges) | `src/app/globals.css`                                                       |
| **Diagram generation API** (OpenAI → nodes/edges)           | `src/app/api/generate-flow/route.ts`                                        |
| **Flow layout** (TB auto-layout, ranks, spacing)            | `src/lib/flow-layout.ts`                                                    |
| **Sample flows + enhanceFlow**                              | `src/services/react-flow.ts`                                                |

### Data flow: diagrams

1. **Generative**: User sends a message (e.g. “Draw a flow for login”). AI calls **`generateFlow`** tool (`tambo.ts`). Tool uses `SAMPLE_FLOWS` or calls **`/api/generate-flow`** (OpenAI). Returns `{ title, description?, nodes, edges }`. AI renders **`FlowDiagram`** (registered in `tambo.ts` components) in the thread; **DiagramCanvas** shows the latest `renderedComponent` on the right.
2. **Interactable**: When there is no generated diagram, the right panel shows **`InteractableFlowDiagram`** (welcome diagram). Tambo can **update** its props (title, nodes, edges) from natural language; component is wrapped with `withInteractable` in `flow-diagram.tsx`.

### Diagram shape (React Flow)

- **Nodes**: `{ id, label, type?: 'input'|'default'|'output', position: { x, y } }`. Positions can be computed by `getLayoutedPositions()` in `flow-layout.ts` (TB layout).
- **Edges**: `{ id, source, target }`.
- **FlowDiagram** accepts `flowDiagramSchema` (title, description?, nodes, edges, height?, className?). Same schema used for generative component and interactable.

### Theme

- **Default**: dark (`getStoredTheme()` returns `"dark"` when nothing in `localStorage`).
- **Layout script** (`layout.tsx`): inline script sets `document.documentElement.classList.toggle('dark', dark)` before paint; when theme is `"system"` it uses `prefers-color-scheme`.
- **Right canvas**: Dotted background in light and dark; dark mode uses charcoal + light dots. Node/edge accent in dark: `oklch(0.92 0.11 166)` (mint).

### Environment

- **`NEXT_PUBLIC_TAMBO_API_KEY`** – required for Tambo.
- **`OPENAI_API_KEY`** – optional; used by `/api/generate-flow` for dynamic diagram generation when topic doesn’t match `SAMPLE_FLOWS`.

---

## Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run lint:fix # ESLint with fix
npx tambo help   # Tambo CLI
```

---

## Adding / changing behavior

- **New generative component**: Implement in `src/components/tambo/`, define Zod props schema, register in `src/lib/tambo.ts` **components** array. AI can then render it in responses.
- **New tool**: Implement in `src/services/` (or call API route), define input/output schemas, add to **tools** in `src/lib/tambo.ts`. Keep **API keys only in API routes** (e.g. `generate-flow`), not in client or `tambo.ts`.
- **Interactable**: Wrap component with `withInteractable(Component, { componentName, description, propsSchema })` and **place it in the tree** (e.g. welcome diagram in `diagram-canvas.tsx`). Do **not** replace the generative component in `tambo.ts` with the interactable.
- **Styling**: Tailwind + `src/app/globals.css`. Diagram canvas: `.diagram-canvas-dotted`, `.dark .diagram-canvas-dotted`; React Flow overrides under `.dark .diagram-canvas-dotted` for nodes, edges, controls, minimap, attribution hidden.

---

## References

- **Tambo**: [docs.tambo.co](https://docs.tambo.co) · [Interactable components](https://docs.tambo.co/concepts/generative-interfaces/interactable-components)
- **React Flow**: [reactflow.dev](https://reactflow.dev)
- **CLAUDE.md** in repo: more detail on Tambo patterns, file structure, and conventions.
