"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolGrid } from "@/components/tools/ToolGrid";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "Files never leave your browser. Zero uploads, zero tracking.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No server queues. Instant processing powered by your device.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Lock,
    title: "Completely Free",
    description: "No sign-ups, no limits, no ads. Every tool is free forever.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

export default function Home() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden pb-16 pt-20 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-6 gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-primary"
              >
                <Shield className="h-3 w-3" />
                Your files never leave your device
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Every PDF tool you need,{" "}
              <span className="bg-linear-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                right in your browser
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Merge, split, compress, convert, and edit PDFs with zero uploads.
              100% client-side processing means your files stay on your device,
              always.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex justify-center"
            >
              <a
                href="#tools"
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explore Tools
                <ArrowDown className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="tools" className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              All Tools
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose a tool to get started — no sign-up required
            </p>
          </div>
          <ToolGrid />
        </div>
      </section>
    </div>
  );
}
