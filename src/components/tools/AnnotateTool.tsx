"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { annotatePdf, type TextAnnotation } from "@/lib/pdf/annotate";

type Stage = "upload" | "configure" | "processing" | "done";

const colorOptions = [
  { label: "Red", value: { r: 0.9, g: 0.1, b: 0.1 } },
  { label: "Blue", value: { r: 0.1, g: 0.1, b: 0.9 } },
  { label: "Green", value: { r: 0.1, g: 0.7, b: 0.1 } },
  { label: "Black", value: { r: 0, g: 0, b: 0 } },
];

interface AnnotationDraft {
  text: string;
  page: number;
  x: number;
  y: number;
  fontSize: number;
  colorIdx: number;
}

const defaultAnnotation: AnnotationDraft = {
  text: "",
  page: 1,
  x: 50,
  y: 50,
  fontSize: 14,
  colorIdx: 0,
};

export function AnnotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationDraft[]>([
    { ...defaultAnnotation },
  ]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const updateAnnotation = (
    index: number,
    field: keyof AnnotationDraft,
    value: string | number
  ) => {
    setAnnotations((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const addAnnotation = () => {
    setAnnotations((prev) => [...prev, { ...defaultAnnotation }]);
  };

  const removeAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    const validAnnotations = annotations.filter((a) => a.text.trim());
    if (validAnnotations.length === 0) return;

    setStage("processing");
    setProgress(0);

    const annots: TextAnnotation[] = validAnnotations.map((a) => ({
      text: a.text,
      page: a.page - 1,
      x: a.x,
      y: a.y,
      fontSize: a.fontSize,
      color: colorOptions[a.colorIdx].value,
    }));

    try {
      const blob = await annotatePdf(files[0], annots, setProgress);
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
    setAnnotations([{ ...defaultAnnotation }]);
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Adding annotations..."
      />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`annotated-${files[0]?.name || "document.pdf"}`}
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

        <div className="space-y-4">
          {annotations.map((ann, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border border-border/50 bg-muted/20 p-4"
            >
              {annotations.length > 1 && (
                <button
                  onClick={() => removeAnnotation(idx)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium">
                  Note #{idx + 1}
                </label>
                <Input
                  value={ann.text}
                  onChange={(e) =>
                    updateAnnotation(idx, "text", e.target.value)
                  }
                  placeholder="Type your annotation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Page
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={ann.page}
                    onChange={(e) =>
                      updateAnnotation(idx, "page", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    X Position
                  </label>
                  <Input
                    type="number"
                    value={ann.x}
                    onChange={(e) =>
                      updateAnnotation(idx, "x", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Y Position
                  </label>
                  <Input
                    type="number"
                    value={ann.y}
                    onChange={(e) =>
                      updateAnnotation(idx, "y", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Font Size
                  </label>
                  <Input
                    type="number"
                    min={8}
                    max={72}
                    value={ann.fontSize}
                    onChange={(e) =>
                      updateAnnotation(
                        idx,
                        "fontSize",
                        parseInt(e.target.value) || 14
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c, ci) => (
                    <button
                      key={c.label}
                      onClick={() => updateAnnotation(idx, "colorIdx", ci)}
                      className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                        ann.colorIdx === ci
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
          ))}
        </div>

        <button
          onClick={addAnnotation}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Another Note
        </button>

        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            size="lg"
            disabled={!annotations.some((a) => a.text.trim())}
          >
            Apply Annotations
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
      label="Drop a PDF to annotate"
    />
  );
}
