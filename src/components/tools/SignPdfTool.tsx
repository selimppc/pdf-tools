"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  Eraser,
  Upload,
  Pen,
  ChevronLeft,
  ChevronRight,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { signPdf, type PageTarget } from "@/lib/pdf/sign";

type Stage = "upload" | "create-sig" | "place" | "processing" | "done";
type SigMethod = "draw" | "upload";

export function SignPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  // Signature state
  const [sigMethod, setSigMethod] = useState<SigMethod>("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // PDF preview state
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageTarget, setPageTarget] = useState<"current" | "all">("current");

  // Signature position (as ratio 0-1 of the preview container)
  const [sigPos, setSigPos] = useState({ x: 0.1, y: 0.75 });
  const [sigSize, setSigSize] = useState({ w: 0.3, h: 0.08 });
  const previewRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const DPR =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, 3)
      : 2;

  // --- Render PDF pages as preview images ---
  const renderPagePreviews = useCallback(async (file: File) => {
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
      setStage("create-sig");
      renderPagePreviews(newFiles[0]);
    }
  };

  // --- Drawing ---
  const getCanvasPos = useCallback(
    (
      e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (
      e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      isDrawing.current = true;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const pos = getCanvasPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [getCanvasPos]
  );

  const draw = useCallback(
    (
      e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const pos = getCanvasPos(e);
      ctx.lineWidth = 2.5 * DPR;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [getCanvasPos, DPR]
  );

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmSignature = () => {
    if (sigMethod === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
    if (signatureDataUrl || sigMethod === "draw") {
      setStage("place");
    }
  };

  const handleUploadSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // --- Drag signature on preview ---
  const handleDragStart = useCallback(
    (e: ReactMouseEvent | ReactTouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const container = previewRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragOffset.current = {
        x: (clientX - rect.left) / rect.width - sigPos.x,
        y: (clientY - rect.top) / rect.height - sigPos.y,
      };
    },
    [sigPos]
  );

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (!isDragging.current || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : e.clientY;
      const newX = (clientX - rect.left) / rect.width - dragOffset.current.x;
      const newY = (clientY - rect.top) / rect.height - dragOffset.current.y;
      setSigPos({
        x: Math.max(0, Math.min(1 - sigSize.w, newX)),
        y: Math.max(0, Math.min(1 - sigSize.h, newY)),
      });
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [sigSize]);

  // --- Apply signature ---
  const handleApply = async () => {
    if (!signatureDataUrl || files.length !== 1) return;
    setStage("processing");
    setProgress(0);

    try {
      const target: PageTarget =
        pageTarget === "all" ? "all" : "current";

      const blob = await signPdf(
        files[0],
        {
          signatureDataUrl,
          position: {
            xRatio: sigPos.x,
            yRatio: sigPos.y,
            widthRatio: sigSize.w,
            heightRatio: sigSize.h,
          },
          currentPage,
          pageTarget: target,
        },
        setProgress
      );
      setResult(blob);
      setStage("done");
    } catch {
      setStage("place");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setSignatureDataUrl(null);
    setPageImages([]);
    setCurrentPage(0);
    setTotalPages(0);
    setSigPos({ x: 0.1, y: 0.75 });
  };

  // --- Processing / Done ---
  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Applying signature..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`signed-${files[0]?.name || "document.pdf"}`}
        onReset={handleReset}
      />
    );
  }

  // --- Step 2: Create Signature (draw or upload) ---
  if (stage === "create-sig") {
    const drawReady =
      sigMethod === "draw" && canvasRef.current !== null;
    const uploadReady =
      sigMethod === "upload" && signatureDataUrl !== null;

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm font-medium">
            {files[0]?.name}{" "}
            {totalPages > 0 && (
              <span className="text-muted-foreground">
                &middot; {totalPages} page{totalPages !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        {/* Method toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSigMethod("draw")}
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
              sigMethod === "draw"
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-border"
            }`}
          >
            <Pen className="h-4 w-4" />
            Draw Signature
          </button>
          <button
            onClick={() => setSigMethod("upload")}
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
              sigMethod === "upload"
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-border"
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
        </div>

        {/* Draw canvas */}
        {sigMethod === "draw" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                Draw your signature
              </label>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            <div className="rounded-xl border-2 border-dashed border-border/50 bg-white">
              <canvas
                ref={canvasRef}
                width={500 * DPR}
                height={150 * DPR}
                style={{ width: 500, height: 150 }}
                className="max-w-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
          </div>
        )}

        {/* Upload input */}
        {sigMethod === "upload" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Upload a signature image (PNG or JPG)
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-8 transition-colors hover:border-primary/50">
              {signatureDataUrl ? (
                <img
                  src={signatureDataUrl}
                  alt="Signature preview"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to choose an image
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleUploadSig}
                className="hidden"
              />
            </label>
            {signatureDataUrl && (
              <button
                onClick={() => setSignatureDataUrl(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Remove and choose another
              </button>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (sigMethod === "draw") {
                const canvas = canvasRef.current;
                if (canvas) {
                  setSignatureDataUrl(canvas.toDataURL("image/png"));
                }
              }
              if (sigMethod === "draw" || signatureDataUrl) {
                confirmSignature();
              }
            }}
            size="lg"
            disabled={sigMethod === "upload" && !signatureDataUrl}
          >
            Next: Position on PDF
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Choose Different File
          </Button>
        </div>
      </div>
    );
  }

  // --- Step 3: Place signature on PDF preview ---
  if (stage === "place") {
    const pageImg = pageImages[currentPage];

    return (
      <div className="space-y-6">
        {/* Page navigation */}
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </p>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* PDF preview with draggable signature */}
        <div className="flex justify-center">
          <div
            ref={previewRef}
            className="relative inline-block select-none overflow-hidden rounded-lg border border-border/50 shadow-lg"
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

            {/* Draggable signature overlay */}
            {signatureDataUrl && (
              <div
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className="absolute cursor-grab border-2 border-dashed border-primary/60 bg-primary/5 active:cursor-grabbing"
                style={{
                  left: `${sigPos.x * 100}%`,
                  top: `${sigPos.y * 100}%`,
                  width: `${sigSize.w * 100}%`,
                  height: `${sigSize.h * 100}%`,
                }}
              >
                <img
                  src={signatureDataUrl}
                  alt="Signature"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
                <div className="absolute -top-6 left-0 flex items-center gap-1 rounded-t-md bg-primary/80 px-2 py-0.5 text-[10px] font-medium text-white">
                  <Move className="h-3 w-3" />
                  Drag to move
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature size control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Signature Size</label>
          <input
            type="range"
            min={10}
            max={50}
            value={sigSize.w * 100}
            onChange={(e) => {
              const w = parseInt(e.target.value) / 100;
              setSigSize({ w, h: w * 0.27 });
            }}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Page target */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Apply To</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPageTarget("current")}
              className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                pageTarget === "current"
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              This Page Only
            </button>
            <button
              onClick={() => setPageTarget("all")}
              className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                pageTarget === "all"
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              All Pages
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleApply} size="lg">
            Apply Signature
          </Button>
          <Button
            onClick={() => setStage("create-sig")}
            variant="outline"
            size="lg"
          >
            Change Signature
          </Button>
        </div>
      </div>
    );
  }

  // --- Step 1: Upload PDF ---
  return (
    <FileDropzone
      accept=".pdf"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a PDF to sign"
    />
  );
}
