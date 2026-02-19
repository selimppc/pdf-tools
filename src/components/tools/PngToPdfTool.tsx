"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import {
  imagesToPdf,
  type PageSize,
  type Orientation,
} from "@/lib/pdf/fromImages";

type Stage = "upload" | "configure" | "processing" | "done";

const pageSizes: { value: PageSize; label: string; description: string }[] = [
  { value: "fit", label: "Auto Fit", description: "A4 page, auto orientation, image fills page" },
  { value: "a4", label: "A4", description: "210 x 297 mm (international standard)" },
  { value: "letter", label: "Letter", description: "8.5 x 11 in (US standard)" },
];

const orientations: { value: Orientation; label: string }[] = [
  { value: "auto", label: "Auto (match image)" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

export function PngToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [orientation, setOrientation] = useState<Orientation>("auto");

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await imagesToPdf(
        files,
        { pageSize, orientation, quality: "maximum", margin: pageSize === "fit" ? 0 : 24 },
        setProgress
      );
      setResult(blob);
      setStage("done");
    } catch (err) {
      console.error("PNG to PDF conversion failed:", err);
      setStage("configure");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setPageSize("fit");
    setOrientation("auto");
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Converting PNG images to PDF..."
      />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={files.length === 1
          ? `${files[0].name.replace(/\.[^.]+$/, "")}.pdf`
          : `png-${files.length}-pages.pdf`}
        onReset={handleReset}
      />
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <FileDropzone
          accept=".png"
          multiple
          files={files}
          onFilesChange={setFiles}
          label="Drop PNG images to convert"
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium">Page Size</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {pageSizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setPageSize(s.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  pageSize === s.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {pageSize !== "fit" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Orientation</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {orientations.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOrientation(o.value)}
                  className={`rounded-xl border px-5 py-3 font-medium transition-all ${
                    orientation === o.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-muted-foreground">
          PNG images are embedded <strong className="text-green-600 dark:text-green-400">losslessly</strong> with full transparency — zoom in or print for maximum detail.
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Convert {files.length} PNG{files.length !== 1 ? "s" : ""} to PDF
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FileDropzone
      accept=".png"
      multiple
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop PNG images to convert to PDF"
    />
  );
}
