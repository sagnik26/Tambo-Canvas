"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ChatEmptyHint } from "@/components/tambo/chat-empty-hint";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { ThreadContainer, useThreadContainerContext } from "./thread-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/tambo/thread-history";
import { useMergeRefs } from "@/lib/thread-hooks";
import { ThreadSwitchProvider, useThreadSwitch } from "@/lib/thread-switch-context";
import type { Suggestion } from "@tambo-ai/react";
import { useTambo } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/tambo/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
  /** When true, hide the thread history sidebar (e.g. for split layout with diagram on the right). */
  hideThreadHistory?: boolean;
}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 */
export const MessageThreadFull = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullProps
>(({ className, variant, hideThreadHistory, ...props }, ref) => {
  const { containerRef, historyPosition } = useThreadContainerContext();
  const mergedRef = useMergeRefs<HTMLDivElement | null>(ref, containerRef);

  const threadHistorySidebar = !hideThreadHistory ? (
    <ThreadHistory position={historyPosition}>
      <ThreadHistoryHeader />
      <ThreadHistoryNewButton />
      <ThreadHistorySearch />
      <ThreadHistoryList />
    </ThreadHistory>
  ) : null;

  const defaultSuggestions: Suggestion[] = [
    {
      id: "suggestion-1",
      title: "Get started",
      detailedSuggestion: "What can you help me with?",
      messageId: "welcome-query",
    },
    {
      id: "suggestion-2",
      title: "Learn more",
      detailedSuggestion: "Tell me about your capabilities.",
      messageId: "capabilities-query",
    },
    {
      id: "suggestion-3",
      title: "Examples",
      detailedSuggestion: "Show me some example queries I can try.",
      messageId: "examples-query",
    },
  ];

  return (
    <ThreadSwitchProvider>
      <div className="flex h-full w-full">
        {/* Thread History Sidebar - rendered first if history is on the left */}
        {!hideThreadHistory && historyPosition === "left" && threadHistorySidebar}

        <ThreadContainer
        ref={mergedRef}
        disableSidebarSpacing
        className={className}
        {...props}
      >
        <div className="relative flex-1 min-h-0 flex flex-col">
          <ChatEmptyHint />
          <ThreadSwitchLoadingOverlay />
          <ScrollableMessageContainer className="p-4">
            <ThreadContent variant={variant}>
              <ThreadContentMessages />
            </ThreadContent>
          </ScrollableMessageContainer>
        </div>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Message input */}
        <div className="px-4 pb-4">
          <MessageInput>
            <MessageInputTextarea placeholder="Describe your diagram..." />
            <MessageInputToolbar>
              <MessageInputSubmitButton />
            </MessageInputToolbar>
            <MessageInputError />
          </MessageInput>
        </div>

        {/* Message suggestions */}
        <MessageSuggestions initialSuggestions={defaultSuggestions}>
          <MessageSuggestionsList />
        </MessageSuggestions>
      </ThreadContainer>

      {/* Thread History Sidebar - rendered last if history is on the right */}
      {!hideThreadHistory &&
        historyPosition === "right" &&
        threadHistorySidebar}
      </div>
    </ThreadSwitchProvider>
  );
});

/**
 * Shows a loading overlay when user has clicked a thread and we're switching to it.
 */
function ThreadSwitchLoadingOverlay() {
  const { loadingThreadId, setLoadingThreadId } = useThreadSwitch();
  const { currentThreadId } = useTambo();

  React.useEffect(() => {
    if (loadingThreadId && currentThreadId === loadingThreadId) {
      setLoadingThreadId(null);
    }
  }, [loadingThreadId, currentThreadId, setLoadingThreadId]);

  if (!loadingThreadId) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 dark:bg-background/90"
      aria-busy
      aria-label="Loading thread"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading thread…</p>
      </div>
    </div>
  );
}
MessageThreadFull.displayName = "MessageThreadFull";
