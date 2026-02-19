"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { splitPdf, getPdfPageCount, type SplitOptions } from "@/lib/pdf/split";

type Stage = "upload" | "configure" | "processing" | "done";

export function SplitTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [mode, setMode] = useState<"ranges" | "extract">("ranges");

  useEffect(() => {
    if (files.length === 1) {
      getPdfPageCount(files[0]).then((count) => {
        setPageCount(count);
        setRangeInput(`1-${count}`);
        setStage("configure");
      });
    }
  }, [files]);

  const parseRanges = (
    input: string
  ): { from: number; to: number }[] | number[] => {
    const parts = input.split(",").map((s) => s.trim());

    if (mode === "extract") {
      return parts
        .map((p) => parseInt(p))
        .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount);
    }

    return parts
      .map((part) => {
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) {
          return {
            from: parseInt(match[1]),
            to: parseInt(match[2]),
          };
        }
        const single = parseInt(part);
        if (!isNaN(single)) {
          return { from: single, to: single };
        }
        return null;
      })
      .filter(Boolean) as { from: number; to: number }[];
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;

    setStage("processing");
    setProgress(0);

    try {
      const parsed = parseRanges(rangeInput);
      const options: SplitOptions =
        mode === "extract"
          ? { mode: "extract", pages: parsed as number[] }
          : {
              mode: "ranges",
              ranges: parsed as { from: number; to: number }[],
            };

      const blob = await splitPdf(files[0], options, setProgress);
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
    setPageCount(0);
    setRangeInput("");
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Splitting your PDF..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename="split.pdf"
        onReset={handleReset}
      />
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">
            PDF loaded: {files[0]?.name} &middot;{" "}
            <span className="text-primary">{pageCount} pages</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "ranges" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("ranges");
                setRangeInput(`1-${pageCount}`);
              }}
            >
              Page Ranges
            </Button>
            <Button
              variant={mode === "extract" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("extract");
                setRangeInput("1");
              }}
            >
              Extract Pages
            </Button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {mode === "ranges"
                ? "Enter page ranges (e.g., 1-3, 5-7)"
                : "Enter page numbers (e.g., 1, 3, 5, 8)"}
            </label>
            <Input
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder={mode === "ranges" ? "1-3, 5-7" : "1, 3, 5, 8"}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleProcess} size="lg">
              Split PDF
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Choose Different File
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FileDropzone
      accept=".pdf"
      files={files}
      onFilesChange={setFiles}
      label="Drop a PDF to split"
    />
  );
}
