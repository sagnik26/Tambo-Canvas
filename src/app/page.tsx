"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ChatEmptyHint } from "@/components/tambo/chat-empty-hint";
import { DiagramCanvas } from "@/components/tambo/diagram-canvas";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="relative flex h-screen w-full bg-background">
        {/* Left: Chat */}
        <div className="relative flex flex-col h-full w-full max-w-[35%] shrink-0 border-r border-border bg-background">
          <ChatEmptyHint />
          <MessageThreadFull hideThreadHistory />
        </div>
        {/* Right: Diagram canvas */}
        <DiagramCanvas />
        {/* Top right: theme toggle (rectangular bar like reference) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-lg bg-muted/80 dark:bg-black/20 border border-border dark:border-white/10 px-1 py-1 shadow-sm">
          <ThemeToggle />
        </div>
      </div>
    </TamboProvider>
  );
}
