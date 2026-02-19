"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { rotatePdf, type RotationAngle } from "@/lib/pdf/rotate";

type Stage = "upload" | "configure" | "processing" | "done";

const angles: { value: RotationAngle; label: string }[] = [
  { value: 90, label: "90° Right" },
  { value: 180, label: "180°" },
  { value: 270, label: "90° Left" },
];

export function RotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [angle, setAngle] = useState<RotationAngle>(90);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await rotatePdf(files[0], { angle }, setProgress);
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
    setAngle(90);
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Rotating pages..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`rotated-${files[0]?.name || "document.pdf"}`}
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
          <label className="block text-sm font-medium">Rotation Angle</label>
          <div className="flex gap-3">
            {angles.map((a) => (
              <button
                key={a.value}
                onClick={() => setAngle(a.value)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 transition-all ${
                  angle === a.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <RotateCw
                  className="h-4 w-4"
                  style={{
                    transform: `rotate(${a.value === 270 ? -90 : a.value}deg)`,
                  }}
                />
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Rotate PDF
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
      label="Drop a PDF to rotate"
    />
  );
}
