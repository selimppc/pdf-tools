"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { summarizePdf } from "@/lib/pdf/summarize";

type Stage = "upload" | "processing" | "done";

export function SummarizeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await summarizePdf(newFiles[0], setProgress);
      setResult(blob);
      const text = await blob.text();
      setPreview(text);
      setStage("done");
    } catch {
      setStage("upload");
    }
  };

  const handleCopy = async () => {
    if (preview) {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setPreview("");
    setCopied(false);
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Analyzing document..." />
    );
  }

  if (stage === "done") {
    const baseName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="max-h-96 overflow-y-auto rounded-xl border border-border/50 bg-muted/30 p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {preview}
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-lg border border-border/50 bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <DownloadButton
          result={result}
          filename={`${baseName}-summary.txt`}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <FileDropzone
      accept=".pdf"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a PDF to summarize"
    />
  );
}
