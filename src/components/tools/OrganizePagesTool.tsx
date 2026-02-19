"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { organizePages } from "@/lib/pdf/organizePages";
import { getPdfPageCount } from "@/lib/pdf/split";

type Stage = "upload" | "configure" | "processing" | "done";

export function OrganizePagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  useEffect(() => {
    if (files.length === 1) {
      getPdfPageCount(files[0]).then((count) => {
        setPageOrder(Array.from({ length: count }, (_, i) => i));
        setStage("configure");
      });
    }
  }, [files]);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      setPageOrder((prev) => {
        const arr = [...prev];
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        return arr;
      });
    },
    []
  );

  const moveDown = useCallback(
    (index: number) => {
      setPageOrder((prev) => {
        if (index >= prev.length - 1) return prev;
        const arr = [...prev];
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
        return arr;
      });
    },
    []
  );

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await organizePages(files[0], pageOrder, setProgress);
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
    setPageOrder([]);
  };

  const reverseAll = () => {
    setPageOrder((prev) => [...prev].reverse());
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Reorganizing pages..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`reordered-${files[0]?.name || "document.pdf"}`}
        onReset={handleReset}
      />
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
            <p className="text-sm font-medium">
              {files[0]?.name} &middot;{" "}
              <span className="text-primary">{pageOrder.length} pages</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reverseAll}>
            Reverse Order
          </Button>
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-4">
          {pageOrder.map((originalPage, idx) => (
            <div
              key={`${originalPage}-${idx}`}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
            >
              <span className="min-w-[2rem] text-center text-xs font-medium text-muted-foreground">
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-medium">
                Page {originalPage + 1}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === pageOrder.length - 1}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Apply New Order
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
      onFilesChange={setFiles}
      label="Drop a PDF to reorder its pages"
    />
  );
}
