"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { organizePages } from "@/lib/pdf/organizePages";

type Stage = "upload" | "loading" | "configure" | "processing" | "done";

export function OrganizePagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderThumbnails = useCallback(async (file: File) => {
    setStage("loading");
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const bytes = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    const count = pdf.numPages;
    setPageOrder(Array.from({ length: count }, (_, i) => i));

    const thumbs: string[] = [];
    for (let i = 1; i <= count; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      thumbs.push(canvas.toDataURL("image/jpeg", 0.7));
      canvas.width = 0;
      canvas.height = 0;
    }
    setThumbnails(thumbs);
    setStage("configure");
  }, []);

  useEffect(() => {
    if (files.length === 1) {
      renderThumbnails(files[0]);
    }
  }, [files, renderThumbnails]);

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    setPageOrder((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(targetIdx, 0, moved);
      return arr;
    });
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

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
    setThumbnails([]);
  };

  const reverseAll = () => setPageOrder((prev) => [...prev].reverse());

  const resetOrder = () =>
    setPageOrder(Array.from({ length: thumbnails.length }, (_, i) => i));

  if (stage === "loading") {
    return (
      <ProcessingView progress={0} message="Generating page previews..." />
    );
  }

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
            <p className="text-sm font-medium">
              {files[0]?.name} &middot;{" "}
              <span className="text-primary">{pageOrder.length} pages</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reverseAll}>
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Reverse
            </Button>
            <Button variant="outline" size="sm" onClick={resetOrder}>
              Reset Order
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Drag and drop thumbnails to reorder pages.
        </p>

        <div
          ref={containerRef}
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        >
          {pageOrder.map((originalPage, idx) => (
            <div
              key={`${originalPage}-${idx}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group relative cursor-grab rounded-xl border-2 p-1.5 transition-all active:cursor-grabbing ${
                dragIdx === idx
                  ? "border-primary/50 opacity-40"
                  : overIdx === idx
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-border/50 hover:border-border hover:shadow-md"
              }`}
            >
              <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                {thumbnails[originalPage] ? (
                  <img
                    src={thumbnails[originalPage]}
                    alt={`Page ${originalPage + 1}`}
                    className="w-full"
                    draggable={false}
                  />
                ) : (
                  <div className="flex aspect-3/4 items-center justify-center bg-muted/30 text-xs text-muted-foreground">
                    ...
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  #{idx + 1}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  was {originalPage + 1}
                </span>
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
