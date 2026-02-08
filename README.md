# TamboFlow

AI-powered flow diagrams from natural language — chat on the left, diagram on the right. Built with Next.js, Tambo AI, and React Flow.

**[Watch the demo on YouTube](https://www.youtube.com/watch?v=9upEMbKmFOM)**

---

## Features

- **Describe flows in plain language** — The AI generates or updates the diagram as you chat.
- **Live diagram canvas** — React Flow on the right: pan, zoom, and drag nodes.
- **Node details** — Click a node to open a side panel. The AI can fill description, suggestions, notes, tags, and related nodes. An **Explain** button asks the AI to populate the panel; the chat input is pre-filled with “Describe this node – [label]”.
- **Summary and export** — Get a text summary of the flow or export the diagram as PNG.
- **Multiple threads** — Each thread has its own diagram state; theme toggle (dark/light).
- **Auth** — Supabase (email/password, optional Google OAuth). Chat is protected; threads and messages are scoped per user.

---

## Tech stack

| Category   | Technologies |
| ---------- | ------------ |
| Framework  | Next.js 15 (App Router), React 19, TypeScript |
| AI / UX    | Tambo AI (`@tambo-ai/react`, `@tambo-ai/typescript-sdk`) |
| Diagrams   | React Flow (`reactflow`) |
| Charts     | Recharts (optional Graph component) |
| Styling    | Tailwind CSS v4, class-variance-authority, tailwind-merge |
| Auth       | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Editor/UI  | Tiptap, Radix UI, Lucide icons |
| Other      | Zod, Framer Motion, html-to-image, highlight.js, react-markdown, DOM Purify |
| API        | Optional OpenAI via `/api/generate-flow` for flow generation |

---

## Tambo features used

- **Provider** — `TamboProvider` wraps `/chat` with API key, `userToken` (Supabase JWT), components, tools, `tamboUrl`, and optional MCP servers.
- **Auth** — `userToken` scopes threads and messages to the logged-in user. When using Supabase, set Tambo dashboard **User Authentication → Verification strategy** to **None** (see [Tambo + Supabase auth](docs/TAMBO_SUPABASE_AUTH.md)).
- **Generative components** — FlowDiagram and Graph are registered in `src/lib/tambo.ts`; the AI renders them in the thread with streamed props.
- **Tools** — generateFlow, enhanceFlow, exportDiagramAsMermaid, summarizeDiagram; plus countryPopulation and globalPopulation (demo). All defined in `src/lib/tambo.ts`.
- **Interactables** — Node details panel uses `withInteractable`; the AI updates description, suggestions, notes, tags, status, and related nodes. **Explain** triggers the AI to fill the panel.
- **Threads** — Tambo manages thread list, current thread, and switching; diagram state is per thread.
- **Thread input** — Chat uses Tambo thread input; clicking a node pre-fills “Describe this node – [label]”.
- **Streaming** — FlowDiagram uses streaming so the diagram appears and updates as the AI responds.

---

## Prerequisites

- **Node.js** 18+ (or version compatible with Next.js 15 / React 19)
- **Tambo API key** — [Tambo](https://docs.tambo.co)
- **Supabase project** — For auth ([Supabase](https://supabase.com))
- **OpenAI API key** (optional) — For `/api/generate-flow` when the topic is not in sample flows

---

## Run locally

Make sure you have the [prerequisites](#prerequisites) (Node.js 18+, Tambo API key, Supabase project). Then follow these steps.

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Tambo-Canvas
npm install
```

### 2. Configure environment variables

Copy the example env file and open it for editing:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the following (get values from the [Tambo](https://docs.tambo.co) and [Supabase](https://supabase.com) dashboards):

| Variable | Where to get it |
| -------- | ---------------- |
| `NEXT_PUBLIC_TAMBO_API_KEY` | Tambo dashboard — required for chat and diagram generation. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key. |

Optional:

- `OPENAI_API_KEY` — For dynamic flow generation when the topic is not in sample flows; used only by the `/api/generate-flow` route.
- `NEXT_PUBLIC_TAMBO_URL` — Only if you use a custom Tambo API base URL.
- `NEXT_PUBLIC_APP_URL` — Set to `http://localhost:3000` for local dev; use your production URL when deploying.

Never commit `.env.local` or real keys to the repo.

### 3. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 4. Use the app

1. Open [http://localhost:3000](http://localhost:3000) in your browser. You’ll see the landing page.
2. Click **Try Now** or **Open Editor** to go to `/chat`. If you’re not signed in, you’ll be redirected to **Login**.
3. Sign up (email/password) or sign in. After auth, you’ll land on the chat page: chat on the left, diagram canvas on the right.
4. Type a flow description (e.g. “Draw a flow for ride cancellation: user requests, check policy, then refund or reject”) and send. The AI will generate the diagram on the right. Click a node to open the details panel and use **Explain** or edit the pre-filled prompt.

For full auth setup (Supabase redirect URLs, Tambo verification strategy, Google OAuth), see [Tambo + Supabase auth](docs/TAMBO_SUPABASE_AUTH.md).

---

## Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_TAMBO_API_KEY` | Yes | Tambo API key |
| `NEXT_PUBLIC_TAMBO_URL` | No | Tambo API base URL (omit to use default) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `OPENAI_API_KEY` | No | Server-side; used by `/api/generate-flow` |
| `NEXT_PUBLIC_APP_URL` | No | Production URL for OAuth redirects (e.g. `https://your-app.vercel.app`) |

Copy from `.env.example`; never commit real secrets.

---

## Scripts

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run lint:fix # ESLint with auto-fix
npx tambo help   # Tambo CLI
```

---

## Project structure

- `src/app` — Routes: `/` (landing), `/login`, `/chat`, `/auth/callback`, etc.
- `src/components/tambo` — Flow diagram, diagram canvas, node details panel, messages, thread.
- `src/lib/tambo.ts` — Tambo component and tool registration.
- `src/services` — Flow generation, sample flows, diagram summary.
- `docs/` — Auth and setup (e.g. [TAMBO_SUPABASE_AUTH.md](docs/TAMBO_SUPABASE_AUTH.md)).

See **CLAUDE.md** in the repo for detailed file roles and development conventions.

---

## Deployment

1. **Build** — `npm run build`. Set all required and optional env vars in your host (e.g. Vercel).
2. **Supabase** — In the dashboard, set **Site URL** and **Redirect URLs** for production; add your production callback URL (e.g. `https://your-app.vercel.app/auth/callback`).
3. **Tambo** — In the Tambo dashboard, set **User Authentication → Verification strategy** to **None** when using Supabase JWTs.

---

## References

- [Tambo](https://docs.tambo.co) — Docs, [user authentication](https://docs.tambo.co/concepts/user-authentication), [interactables](https://docs.tambo.co/concepts/generative-interfaces/interactable-components)
- [React Flow](https://reactflow.dev)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Tambo + Supabase auth](docs/TAMBO_SUPABASE_AUTH.md) — Step-by-step auth and Tambo setup
