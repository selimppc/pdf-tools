"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { ocrDocument } from "@/lib/pdf/ocr";

type Stage = "upload" | "configure" | "processing" | "done";

const languages = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "por", label: "Portuguese" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
];

export function OcrTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await ocrDocument(files[0], language, setProgress);
      setResult(blob);
      const text = await blob.text();
      setPreview(text);
      setStage("done");
    } catch {
      setStage("configure");
    }
  };

  const handleCopy = async () => {
    if (preview) {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setPreview("");
    setCopied(false);
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Running OCR (this may take a moment)..."
      />
    );
  }

  if (stage === "done") {
    const baseName = files[0]?.name?.replace(/\.[^.]+$/, "") || "ocr-result";
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="max-h-80 overflow-y-auto rounded-xl border border-border/50 bg-muted/30 p-5 font-mono text-sm leading-relaxed">
            {preview.slice(0, 5000)}
            {preview.length > 5000 && (
              <p className="mt-4 text-muted-foreground">
                ... {preview.length - 5000} more characters
              </p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-lg border border-border/50 bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <DownloadButton
          result={result}
          filename={`${baseName}-ocr.txt`}
          onReset={handleReset}
        />
      </div>
    );
  }

  if (stage === "configure") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">{files[0]?.name}</p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-muted-foreground">
          OCR runs <strong className="text-cyan-600 dark:text-cyan-400">100% in your browser</strong> using Tesseract.js. No data leaves your device. First run downloads language data (~2MB).
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Document Language</label>
          <div className="grid gap-2 sm:grid-cols-5">
            {languages.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                  language === l.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Start OCR
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
      accept=".pdf,.jpg,.jpeg,.png"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a scanned PDF or image for OCR"
    />
  );
}
