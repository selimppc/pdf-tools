"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { pdfToImages, type ToImagesOptions } from "@/lib/pdf/toImages";

type Stage = "upload" | "configure" | "processing" | "done";

const qualityOptions = [
  { value: 0.7, label: "Good", description: "Smaller file size" },
  { value: 0.85, label: "High", description: "Balanced" },
  { value: 1.0, label: "Maximum", description: "Best quality" },
];

const scaleOptions = [
  { value: 1, label: "1x", description: "72 DPI" },
  { value: 2, label: "2x", description: "144 DPI" },
  { value: 3, label: "3x", description: "216 DPI" },
];

export function PdfToImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.85);
  const [scale, setScale] = useState(2);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const options: ToImagesOptions = {
        format: "jpeg",
        quality,
        scale,
      };
      const blob = await pdfToImages(files[0], options, setProgress);
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
    setQuality(0.85);
    setScale(2);
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Converting pages to images..."
      />
    );
  }

  if (stage === "done") {
    const baseName = files[0]?.name?.replace(/\.pdf$/i, "") || "pages";
    return (
      <DownloadButton
        result={result}
        filename={`${baseName}-images.zip`}
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
          <label className="block text-sm font-medium">Image Quality</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {qualityOptions.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  quality === q.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <p className="font-medium">{q.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {q.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Resolution</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {scaleOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setScale(s.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  scale === s.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Convert to JPG
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
      label="Drop a PDF to convert to images"
    />
  );
}
