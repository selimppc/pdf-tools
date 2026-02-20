"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Type,
  Highlighter,
  Pen,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { annotatePdf, type Annotation } from "@/lib/pdf/annotate";

type Stage = "upload" | "annotate" | "processing" | "done";
type Tool = "text" | "highlight" | "draw";

const COLORS = [
  { label: "Red", value: { r: 0.9, g: 0.1, b: 0.1 }, css: "#e61919" },
  { label: "Blue", value: { r: 0.1, g: 0.3, b: 0.9 }, css: "#1a4de6" },
  { label: "Green", value: { r: 0.1, g: 0.7, b: 0.1 }, css: "#1ab31a" },
  { label: "Yellow", value: { r: 1, g: 0.85, b: 0 }, css: "#ffd900" },
  { label: "Black", value: { r: 0, g: 0, b: 0 }, css: "#1a1a1a" },
];

export function AnnotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [activeTool, setActiveTool] = useState<Tool>("text");
  const [colorIdx, setColorIdx] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(16);

  const previewRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const drawPoints = useRef<{ xRatio: number; yRatio: number }[]>([]);
  const highlightStart = useRef<{ x: number; y: number } | null>(null);
  const [liveHighlight, setLiveHighlight] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [liveDrawPoints, setLiveDrawPoints] = useState<
    { x: number; y: number }[]
  >([]);

  const renderPreviews = useCallback(async (file: File) => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    setTotalPages(pdf.numPages);

    const images: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.85));
      canvas.width = 0;
      canvas.height = 0;
    }
    setPageImages(images);
  }, []);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setStage("annotate");
      renderPreviews(newFiles[0]);
    }
  };

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    const el = previewRef.current;
    if (!el) return { xRatio: 0, yRatio: 0, xPx: 0, yPx: 0 };
    const rect = el.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      xRatio: (clientX - rect.left) / rect.width,
      yRatio: (clientY - rect.top) / rect.height,
      xPx: clientX - rect.left,
      yPx: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getRelativePos(e);

    if (activeTool === "text") {
      if (!textInput.trim()) return;
      const newAnn: Annotation = {
        type: "text",
        text: textInput.trim(),
        page: currentPage,
        xRatio: pos.xRatio,
        yRatio: pos.yRatio,
        fontSize,
        color: COLORS[colorIdx].value,
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === "highlight") {
      highlightStart.current = { x: pos.xRatio, y: pos.yRatio };
      isDrawing.current = true;
    } else if (activeTool === "draw") {
      isDrawing.current = true;
      drawPoints.current = [{ xRatio: pos.xRatio, yRatio: pos.yRatio }];
      setLiveDrawPoints([{ x: pos.xRatio * 100, y: pos.yRatio * 100 }]);
    }
  };

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const el = previewRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const xRatio = (clientX - rect.left) / rect.width;
      const yRatio = (clientY - rect.top) / rect.height;

      if (activeTool === "highlight" && highlightStart.current) {
        const s = highlightStart.current;
        setLiveHighlight({
          x: Math.min(s.x, xRatio) * 100,
          y: Math.min(s.y, yRatio) * 100,
          w: Math.abs(xRatio - s.x) * 100,
          h: Math.abs(yRatio - s.y) * 100,
        });
      } else if (activeTool === "draw") {
        drawPoints.current.push({ xRatio, yRatio });
        setLiveDrawPoints((prev) => [
          ...prev,
          { x: xRatio * 100, y: yRatio * 100 },
        ]);
      }
    },
    [activeTool]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (activeTool === "highlight" && highlightStart.current && liveHighlight) {
      const s = highlightStart.current;
      const el = previewRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const endXRatio = (liveHighlight.x + liveHighlight.w) / 100;
      const endYRatio = (liveHighlight.y + liveHighlight.h) / 100;
      const startXRatio = liveHighlight.x / 100;
      const startYRatio = liveHighlight.y / 100;

      if (Math.abs(endXRatio - startXRatio) > 0.01) {
        setAnnotations((prev) => [
          ...prev,
          {
            type: "highlight" as const,
            page: currentPage,
            xRatio: startXRatio,
            yRatio: startYRatio,
            widthRatio: endXRatio - startXRatio,
            heightRatio: endYRatio - startYRatio,
            color: COLORS[colorIdx].value,
            opacity: 0.3,
          },
        ]);
      }
      highlightStart.current = null;
      setLiveHighlight(null);
    } else if (activeTool === "draw" && drawPoints.current.length > 1) {
      setAnnotations((prev) => [
        ...prev,
        {
          type: "draw" as const,
          page: currentPage,
          points: [...drawPoints.current],
          color: COLORS[colorIdx].value,
          lineWidth: 2,
        },
      ]);
      drawPoints.current = [];
      setLiveDrawPoints([]);
    }
  }, [activeTool, colorIdx, currentPage, liveHighlight]);

  useEffect(() => {
    const up = () => {
      if (isDrawing.current) handlePointerUp();
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [handlePointerUp]);

  const undoLast = () => setAnnotations((prev) => prev.slice(0, -1));
  const clearPage = () =>
    setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  const handleApply = async () => {
    if (files.length !== 1 || annotations.length === 0) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await annotatePdf(files[0], annotations, setProgress);
      setResult(blob);
      setStage("done");
    } catch {
      setStage("annotate");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setAnnotations([]);
    setPageImages([]);
    setCurrentPage(0);
    setTotalPages(0);
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Adding annotations..." />
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

  if (stage === "annotate") {
    const pageImg = pageImages[currentPage];

    return (
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
          {/* Tool buttons */}
          <div className="flex gap-1.5">
            {(
              [
                { tool: "text" as Tool, icon: Type, label: "Text" },
                {
                  tool: "highlight" as Tool,
                  icon: Highlighter,
                  label: "Highlight",
                },
                { tool: "draw" as Tool, icon: Pen, label: "Draw" },
              ] as const
            ).map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  activeTool === tool
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/50" />

          {/* Colors */}
          <div className="flex gap-1.5">
            {COLORS.map((c, ci) => (
              <button
                key={c.label}
                onClick={() => setColorIdx(ci)}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  colorIdx === ci
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.css }}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-border/50" />

          {/* Undo / Clear */}
          <button
            onClick={undoLast}
            disabled={annotations.length === 0}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={clearPage}
            disabled={pageAnnotations.length === 0}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Text input (visible in text mode) */}
        {activeTool === "text" && (
          <div className="flex gap-3">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type text, then click on the page to place it"
              className="flex-1"
            />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="rounded-lg border border-border/50 bg-background px-3 text-sm"
            >
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTool === "highlight" && (
          <p className="text-sm text-muted-foreground">
            Click and drag on the page to draw a highlight rectangle.
          </p>
        )}

        {activeTool === "draw" && (
          <p className="text-sm text-muted-foreground">
            Click and draw freely on the page.
          </p>
        )}

        {/* Page navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
            {pageAnnotations.length > 0 && (
              <span className="ml-2 text-primary">
                ({pageAnnotations.length} annotation
                {pageAnnotations.length !== 1 ? "s" : ""})
              </span>
            )}
          </p>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* PDF preview with annotations overlay */}
        <div className="flex justify-center">
          <div
            ref={previewRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            className={`relative inline-block select-none overflow-hidden rounded-lg border border-border/50 shadow-lg ${
              activeTool === "text"
                ? "cursor-crosshair"
                : activeTool === "draw"
                  ? "cursor-crosshair"
                  : "cursor-crosshair"
            }`}
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
          >
            {pageImg ? (
              <img
                src={pageImg}
                alt={`Page ${currentPage + 1}`}
                className="block max-h-[70vh] w-auto"
                draggable={false}
              />
            ) : (
              <div className="flex h-96 w-64 items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                Loading preview...
              </div>
            )}

            {/* Render existing annotations on this page */}
            {pageAnnotations.map((ann, i) => {
              if (ann.type === "text") {
                return (
                  <div
                    key={i}
                    className="pointer-events-none absolute whitespace-nowrap font-sans font-medium"
                    style={{
                      left: `${ann.xRatio * 100}%`,
                      top: `${ann.yRatio * 100}%`,
                      fontSize: `${ann.fontSize * 0.75}px`,
                      color: COLORS.find(
                        (c) =>
                          c.value.r === ann.color.r &&
                          c.value.g === ann.color.g &&
                          c.value.b === ann.color.b
                      )?.css || "#000",
                      transform: "translateY(-100%)",
                    }}
                  >
                    {ann.text}
                  </div>
                );
              }
              if (ann.type === "highlight") {
                return (
                  <div
                    key={i}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${ann.xRatio * 100}%`,
                      top: `${ann.yRatio * 100}%`,
                      width: `${ann.widthRatio * 100}%`,
                      height: `${ann.heightRatio * 100}%`,
                      backgroundColor:
                        COLORS.find(
                          (c) =>
                            c.value.r === ann.color.r &&
                            c.value.g === ann.color.g &&
                            c.value.b === ann.color.b
                        )?.css || "#ffff00",
                      opacity: ann.opacity,
                    }}
                  />
                );
              }
              if (ann.type === "draw" && ann.points.length > 1) {
                const pathData = ann.points
                  .map((p, j) =>
                    j === 0
                      ? `M ${p.xRatio * 100} ${p.yRatio * 100}`
                      : `L ${p.xRatio * 100} ${p.yRatio * 100}`
                  )
                  .join(" ");
                return (
                  <svg
                    key={i}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={pathData}
                      fill="none"
                      stroke={
                        COLORS.find(
                          (c) =>
                            c.value.r === ann.color.r &&
                            c.value.g === ann.color.g &&
                            c.value.b === ann.color.b
                        )?.css || "#000"
                      }
                      strokeWidth="0.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );
              }
              return null;
            })}

            {/* Live highlight rect */}
            {liveHighlight && (
              <div
                className="pointer-events-none absolute border-2 border-dashed"
                style={{
                  left: `${liveHighlight.x}%`,
                  top: `${liveHighlight.y}%`,
                  width: `${liveHighlight.w}%`,
                  height: `${liveHighlight.h}%`,
                  backgroundColor: COLORS[colorIdx].css,
                  opacity: 0.25,
                  borderColor: COLORS[colorIdx].css,
                }}
              />
            )}

            {/* Live draw path */}
            {liveDrawPoints.length > 1 && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={liveDrawPoints
                    .map((p, j) =>
                      j === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke={COLORS[colorIdx].css}
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleApply}
            size="lg"
            disabled={annotations.length === 0}
          >
            Apply {annotations.length} Annotation
            {annotations.length !== 1 ? "s" : ""}
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
