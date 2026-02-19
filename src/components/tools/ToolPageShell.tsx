"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ToolDefinition } from "@/config/tools";

interface ToolPageShellProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolPageShell({ tool, children }: ToolPageShellProps) {
  const Icon = tool.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            All Tools
          </Button>
        </Link>
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tool.bgColor}`}
          >
            <Icon className={`h-7 w-7 ${tool.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {tool.name}
              </h1>
              <Badge
                variant="outline"
                className="hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:flex"
              >
                <Shield className="h-3 w-3" />
                Private
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
