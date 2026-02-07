"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface ExploreCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ExploreCard({
  title,
  description,
  href,
  icon,
  className,
  delay = 0,
}: ExploreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={href} className="block h-full group">
        <motion.div
          className={cn(
            "relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left",
            "transition-colors duration-300",
            "hover:border-cyan-500/30 hover:bg-white/[0.06]",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-cyan-500/5 before:via-transparent before:to-teal-500/5 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
            className
          )}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="relative z-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-400/90 transition-colors group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-white/95 group-hover:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-white/60">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
              Open Editor
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
