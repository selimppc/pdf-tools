"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingViewProps {
  progress: number;
  message?: string;
}

export function ProcessingView({
  progress,
  message = "Processing your file...",
}: ProcessingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card p-10 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-10 w-10 text-primary" />
      </motion.div>
      <div className="w-full max-w-xs space-y-3">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}
