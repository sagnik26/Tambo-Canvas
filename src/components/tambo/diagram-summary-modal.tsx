"use client";

import { Tooltip } from "@/components/tambo/suggestions-tooltip";
import {
  getDiagramSummary,
  getLatestDiagramData,
} from "@/lib/diagram-summary";
import { cn } from "@/lib/utils";
import { useTambo } from "@tambo-ai/react";
import { FileText, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

export function DiagramSummaryModal({
  isOpen,
  onClose,
  summary,
}: {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
}) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl border shadow-lg",
          "border-border bg-card text-card-foreground",
          "dark:border-white/10 dark:bg-zinc-900"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2
              id="summary-modal-title"
              className="text-lg font-semibold"
            >
              Diagram summary
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {summary}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DiagramSummaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { thread } = useTambo();
  const [open, setOpen] = React.useState(false);
  const [summaryText, setSummaryText] = React.useState("");

  const hasStarted = (thread?.messages?.length ?? 0) > 0;
  const diagramData = React.useMemo(
    () => getLatestDiagramData(thread),
    [thread],
  );

  const handleClick = () => {
    const summary = getDiagramSummary(diagramData.nodes, diagramData.edges, {
      title: diagramData.title,
      description: diagramData.description,
    });
    setSummaryText(summary);
    setOpen(true);
  };

  return (
    <>
      <Tooltip content="Summarize diagram" side="top">
        <button
          type="button"
          data-slot="toolbar-right"
          onClick={handleClick}
          disabled={!hasStarted}
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            "transition-colors",
            className,
          )}
          aria-label="Summarize diagram"
          {...props}
        >
          <FileText className="h-4 w-4" />
        </button>
      </Tooltip>
      <DiagramSummaryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        summary={summaryText}
      />
    </>
  );
}
