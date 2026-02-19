"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import {
  addPageNumbers,
  type NumberPosition,
  type PageNumberOptions,
} from "@/lib/pdf/pageNumbers";

type Stage = "upload" | "configure" | "processing" | "done";

const positions: { value: NumberPosition; label: string }[] = [
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "top-center", label: "Top Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
];

const formats: { value: PageNumberOptions["format"]; label: string }[] = [
  { value: "number", label: "1, 2, 3..." },
  { value: "page-of-total", label: "Page 1 of N" },
];

export function PageNumbersTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [position, setPosition] = useState<NumberPosition>("bottom-center");
  const [format, setFormat] = useState<PageNumberOptions["format"]>("number");
  const [fontSize, setFontSize] = useState(12);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await addPageNumbers(
        files[0],
        { position, fontSize, startNumber: 1, format },
        setProgress
      );
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
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Adding page numbers..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`numbered-${files[0]?.name || "document.pdf"}`}
        onReset={handleReset}
      />
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">{files[0]?.name}</p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Position</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {positions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPosition(p.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  position === p.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Format</label>
          <div className="flex gap-3">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                  format === f.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Font Size</label>
          <div className="flex gap-2">
            {[10, 12, 14, 16].map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  fontSize === s
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {s}pt
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Add Page Numbers
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
      label="Drop a PDF to add page numbers"
    />
  );
}
