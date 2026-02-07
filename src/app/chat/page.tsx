"use client";

import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatEmptyHint } from "@/components/tambo/chat-empty-hint";
import { DiagramCanvas } from "@/components/tambo/diagram-canvas";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useRef, useState } from "react";

export default function ChatPage() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    const el = diagramRef.current;
    if (!el || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: "oklch(0.202 0 0)",
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `diagram-${Date.now()}.png`;
      a.click();
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="relative flex h-screen w-full bg-background">
      <div className="relative flex h-full w-full max-w-[35%] shrink-0 flex-col border-r border-border bg-background">
        <ChatEmptyHint />
        <MessageThreadFull hideThreadHistory />
      </div>
      <DiagramCanvas canvasRef={diagramRef} />
      <div
        className={cn(
          "absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border px-1 py-1 shadow-sm",
          "border-border bg-muted/80 dark:border-white/10 dark:bg-black/20"
        )}
      >
        <ThemeToggle />
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "bg-accent dark:bg-white/10 text-muted-foreground dark:text-white/90",
            "hover:text-accent-foreground dark:hover:text-white border border-border dark:border-white/10",
            "transition-colors cursor-pointer disabled:opacity-50"
          )}
          aria-label="Export diagram as PNG"
        >
          <Download className="h-4 w-4" />
        </button>
        <UserMenu />
      </div>
    </div>
  );
}
