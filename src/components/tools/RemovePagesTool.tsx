"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { removePages } from "@/lib/pdf/removePages";
import { getPdfPageCount } from "@/lib/pdf/split";

type Stage = "upload" | "configure" | "processing" | "done";

export function RemovePagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageInput, setPageInput] = useState("");

  useEffect(() => {
    if (files.length === 1) {
      getPdfPageCount(files[0]).then((count) => {
        setPageCount(count);
        setStage("configure");
      });
    }
  }, [files]);

  const parsePages = (input: string): number[] => {
    return input
      .split(",")
      .map((s) => s.trim())
      .map((s) => parseInt(s))
      .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount);
  };

  const handleProcess = async () => {
    const pages = parsePages(pageInput);
    if (pages.length === 0 || pages.length >= pageCount) return;

    setStage("processing");
    setProgress(0);
    try {
      const blob = await removePages(files[0], pages, setProgress);
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
    setPageInput("");
  };

  if (stage === "processing") {
    return <ProcessingView progress={progress} message="Removing pages..." />;
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`trimmed-${files[0]?.name || "document.pdf"}`}
        onReset={handleReset}
      />
    );
  }

  if (stage === "configure") {
    const parsed = parsePages(pageInput);
    const remaining = pageCount - parsed.length;

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">
            {files[0]?.name} &middot;{" "}
            <span className="text-primary">{pageCount} pages</span>
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pages to remove (e.g., 1, 3, 5)
          </label>
          <Input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="1, 3, 5"
          />
          {pageInput && (
            <p className="mt-2 text-xs text-muted-foreground">
              Removing {parsed.length} page{parsed.length !== 1 ? "s" : ""}{" "}
              &middot; {remaining} page{remaining !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            size="lg"
            disabled={parsed.length === 0 || remaining <= 0}
          >
            Remove {parsed.length} Page{parsed.length !== 1 ? "s" : ""}
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
      label="Drop a PDF to remove pages"
    />
  );
}
