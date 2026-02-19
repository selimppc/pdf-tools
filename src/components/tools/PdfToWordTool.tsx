"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { pdfToWord } from "@/lib/pdf/pdfToWord";

type Stage = "upload" | "processing" | "done";

export function PdfToWordTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await pdfToWord(newFiles[0], setProgress);
      setResult(blob);
      setStage("done");
    } catch {
      setStage("upload");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Extracting text to Word format..."
      />
    );
  }

  if (stage === "done") {
    const baseName = files[0]?.name?.replace(/\.pdf$/i, "") || "document";
    return (
      <DownloadButton
        result={result}
        filename={`${baseName}.doc`}
        onReset={handleReset}
      />
    );
  }

  return (
    <FileDropzone
      accept=".pdf"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a PDF to convert to Word"
    />
  );
}
