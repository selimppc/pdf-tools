"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { addWatermark, type WatermarkOptions } from "@/lib/pdf/watermark";

type Stage = "upload" | "configure" | "processing" | "done";

const colorPresets = [
  { label: "Gray", value: { r: 0.5, g: 0.5, b: 0.5 } },
  { label: "Red", value: { r: 0.8, g: 0.1, b: 0.1 } },
  { label: "Blue", value: { r: 0.1, g: 0.1, b: 0.8 } },
  { label: "Black", value: { r: 0, g: 0, b: 0 } },
];

export function WatermarkTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(-45);
  const [colorIdx, setColorIdx] = useState(0);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1 || !text.trim()) return;
    setStage("processing");
    setProgress(0);
    try {
      const options: WatermarkOptions = {
        text: text.trim(),
        fontSize,
        opacity,
        rotation,
        color: colorPresets[colorIdx].value,
      };
      const blob = await addWatermark(files[0], options, setProgress);
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
    setText("CONFIDENTIAL");
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Adding watermark..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`watermarked-${files[0]?.name || "document.pdf"}`}
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

        <div>
          <label className="mb-2 block text-sm font-medium">
            Watermark Text
          </label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="CONFIDENTIAL"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Font Size</label>
            <div className="flex gap-2">
              {[40, 60, 80, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    fontSize === s
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Opacity</label>
            <div className="flex gap-2">
              {[
                { v: 0.1, l: "Light" },
                { v: 0.2, l: "Medium" },
                { v: 0.4, l: "Heavy" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setOpacity(o.v)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    opacity === o.v
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {colorPresets.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => setColorIdx(i)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    colorIdx === i
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Angle</label>
          <div className="flex gap-2">
            {[
              { v: -45, l: "Diagonal ↗" },
              { v: 0, l: "Horizontal" },
              { v: 45, l: "Diagonal ↘" },
            ].map((a) => (
              <button
                key={a.v}
                onClick={() => setRotation(a.v)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  rotation === a.v
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {a.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg" disabled={!text.trim()}>
            Add Watermark
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
      label="Drop a PDF to add a watermark"
    />
  );
}
