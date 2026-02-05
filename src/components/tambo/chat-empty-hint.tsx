"use client";

import { useTambo } from "@tambo-ai/react";
import * as React from "react";

export function ChatEmptyHint() {
  const { thread } = useTambo();
  const messages = thread?.messages ?? [];

  const hasChat = React.useMemo(
    () =>
      messages.some(
        (m) =>
          (m?.role === "user" || m?.role === "assistant") && !m?.isCancelled
      ),
    [messages]
  );

  if (hasChat) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
      <p className="text-muted-foreground text-center text-sm">
        Start a conversation by generating a diagram!
      </p>
    </div>
  );
}
