"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

export function FeatureCard({
  title,
  description,
  icon,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay }}
      className="h-full"
    >
      <motion.div
        className={cn(
          "flex h-full gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5",
          "transition-colors duration-300 hover:border-teal-500/20 hover:bg-white/[0.04]"
        )}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-white/90">{title}</h4>
          <p className="mt-1 text-sm text-white/55">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
