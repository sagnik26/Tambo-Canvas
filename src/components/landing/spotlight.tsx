"use client";

import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]",
        className
      )}
    />
  );
}
