"use client";

import { Download, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DownloadButtonProps {
  result: Blob | null;
  filename: string;
  onReset: () => void;
}

export function DownloadButton({
  result,
  filename,
  onReset,
}: DownloadButtonProps) {
  if (!result) return null;

  const handleDownload = () => {
    const url = URL.createObjectURL(result);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
      </div>
      <div>
        <p className="text-lg font-semibold">Processing Complete</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filename} &middot; {formatSize(result.size)}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleDownload} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button onClick={onReset} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
      </div>
    </motion.div>
  );
}
