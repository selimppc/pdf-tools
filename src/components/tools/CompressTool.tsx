"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { compressPdf, type CompressionLevel } from "@/lib/pdf/compress";

type Stage = "upload" | "configure" | "processing" | "done";

const levels: { value: CompressionLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "High quality (150 DPI), moderate size reduction" },
  { value: "medium", label: "Medium", description: "Good quality (120 DPI), strong size reduction" },
  { value: "high", label: "High", description: "Screen quality (90 DPI), maximum compression" },
];

export function CompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await compressPdf(files[0], level, setProgress);
      setResult(blob);
      setStage("done");
    } catch {
      setStage("configure");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setLevel("medium");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Compressing your PDF..."
      />
    );
  }

  if (stage === "done") {
    const savings = files[0]
      ? (((files[0].size - (result?.size || 0)) / files[0].size) * 100).toFixed(
          1
        )
      : "0";

    return (
      <div className="space-y-4">
        {Number(savings) > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center text-sm">
            Reduced by <span className="font-semibold text-emerald-500">{savings}%</span>
            {" "}&middot;{" "}
            {formatSize(files[0].size)} → {formatSize(result?.size || 0)}
          </div>
        )}
        <DownloadButton
          result={result}
          filename={`compressed-${files[0]?.name || "document.pdf"}`}
          onReset={handleReset}
        />
      </div>
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">
            {files[0]?.name} &middot;{" "}
            <span className="text-muted-foreground">
              {formatSize(files[0]?.size || 0)}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Compression Level</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  level === l.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <p className="font-medium">{l.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {l.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Compress PDF
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Choose Different File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FileDropzone
      accept=".pdf"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a PDF to compress"
    />
  );
}
