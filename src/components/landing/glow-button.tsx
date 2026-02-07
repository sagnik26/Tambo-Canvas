"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

const base =
  "relative inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:pointer-events-none";

const glow =
  "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-cyan-500 before:via-teal-500 before:to-emerald-500 before:opacity-80 before:blur-xl before:transition-opacity before:duration-300 hover:before:opacity-100";

interface GlowButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function GlowButton({ children, className, href }: GlowButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, glow, "overflow-hidden", className)}
      >
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }
  return (
    <button type="button" className={cn(base, glow, "overflow-hidden", className)}>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
