"use client";

import { AnimatedGrid } from "@/components/landing/animated-grid";
import { ExploreCard } from "@/components/landing/explore-card";
import { FeatureCard } from "@/components/landing/feature-card";
import { GlowButton } from "@/components/landing/glow-button";
import { GradientText } from "@/components/landing/gradient-text";
import { Spotlight } from "@/components/landing/spotlight";
import { cn } from "@/lib/utils";
import {
  Blocks,
  GitBranch,
  MessageSquare,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};
const stagger = 0.12;
const duration = 0.5;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] text-white">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]" />

      {/* Subtle glow orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px]" />

      <AnimatedGrid />
      <Spotlight />

      {/* First screen: exactly 100vh so only hero is visible on load */}
      <div className="relative z-10 flex h-screen min-h-[100dvh] flex-col overflow-hidden">
        {/* Nav */}
        <nav className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-lg font-semibold tracking-tight"
        >
          <span className="text-white/90">Tambo</span>
          <GradientText className="ml-1.5">Canvas</GradientText>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link
            href="/chat"
            className={cn(
              "rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/90",
              "transition-colors hover:bg-white/10 hover:text-white",
            )}
          >
            Try Now
          </Link>
        </motion.div>
        </nav>

        {/* Hero */}
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-8 md:px-12">
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration, delay: stagger * 0 }}
          className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400/90"
        >
          AI-Powered Diagrams
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration, delay: stagger * 1 }}
          className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Turn concepts into{" "}
          <GradientText className="font-bold">stunning diagrams</GradientText>
          <br />
          in seconds
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration, delay: stagger * 2 }}
          className="mt-10 max-w-2xl text-lg text-white/70 sm:text-2xl"
        >
          Describe your flow in plain language.
        </motion.p>

        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration, delay: stagger * 2 }}
          className="mt-2 max-w-3xl text-sm text-white/70 font-bold sm:text-lg"
        >
          Watch AI craft clean block diagrams, sequence diagrams, and more —
          instantly.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration, delay: stagger * 3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <GlowButton href="/chat">Start creating for free</GlowButton>
          <Link
            href="/chat"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            Open Editor
          </Link>
        </motion.div>
        </main>
      </div>

      {/* Explore: AI generators */}
      <section className="relative z-10 px-6 py-24 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          <h2 className="text-center text-2xl font-semibold text-white/95 sm:text-3xl">
            Explore AI generators
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/60">
            Create block diagrams, sequence diagrams, and mindmaps with
            specialized AI—pick one and start in the editor.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <ExploreCard
              title="Block diagrams"
              description="System architectures, workflows, and component layouts from a simple description."
              href="/chat"
              icon={<Blocks className="h-6 w-6" />}
              delay={0}
            />
            <ExploreCard
              title="Sequence diagrams"
              description="Message flows and interactions between actors—perfect for APIs and processes."
              href="/chat"
              icon={<GitBranch className="h-6 w-6" />}
              delay={0.08}
            />
            <ExploreCard
              title="Mindmaps"
              description="Ideas and hierarchies in a visual map. Great for brainstorming and structure."
              href="/chat"
              icon={<Sparkles className="h-6 w-6" />}
              delay={0.16}
            />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="text-2xl font-semibold text-white/95 sm:text-3xl">
            Built for clarity
          </h2>
          <p className="mt-3 text-white/60">
            Everything you need to go from text to visuals.
          </p>
        </motion.div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
          <FeatureCard
            title="Natural language"
            description="No syntax to learn. Describe in plain English and get a diagram."
            icon={<Type className="h-5 w-5" />}
            delay={0}
          />
          <FeatureCard
            title="Real-time streaming"
            description="See the diagram update as the AI responds—no waiting for a full render."
            icon={<Zap className="h-5 w-5" />}
            delay={0.06}
          />
          <FeatureCard
            title="Conversation context"
            description="Refine with follow-up messages. The AI remembers your thread and diagram."
            icon={<MessageSquare className="h-5 w-5" />}
            delay={0.12}
          />
          <FeatureCard
            title="Interactive canvas"
            description="Pan, zoom, and drag. Export or keep iterating in the same session."
            icon={<Blocks className="h-5 w-5" />}
            delay={0.18}
          />
        </div>
      </section>

      {/* One chat CTA */}
      <section className="relative z-10 px-6 py-24 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-12 text-center sm:px-12"
        >
          <h2 className="text-2xl font-semibold text-white/90 sm:text-3xl">
            One chat. Any diagram.
          </h2>
          <p className="mt-3 text-white/60">
            Block diagrams, sequence diagrams, mindmaps—generated from your
            words. No drawing required.
          </p>
          <div className="mt-8">
            <GlowButton href="/chat">Go to Editor</GlowButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
