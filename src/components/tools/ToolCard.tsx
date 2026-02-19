"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { ToolDefinition } from "@/config/tools";

interface ToolCardProps {
  tool: ToolDefinition;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={tool.implemented ? `/tools/${tool.slug}` : "#"}>
        <div
          className={`group relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 ${
            tool.implemented
              ? "cursor-pointer hover:border-border hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              : "cursor-default opacity-60"
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${tool.bgColor} transition-colors duration-300`}
            >
              <Icon className={`h-5 w-5 ${tool.color}`} />
            </div>
            {!tool.implemented && (
              <Badge variant="secondary" className="text-[10px]">
                Soon
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{tool.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
