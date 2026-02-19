"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { htmlToPdf } from "@/lib/pdf/htmlToPdf";

type Stage = "upload" | "processing" | "done";

export function HtmlToPdfTool() {
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
      const blob = await htmlToPdf(newFiles[0], setProgress);
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
        message="Converting HTML to PDF..."
      />
    );
  }

  if (stage === "done") {
    const baseName =
      files[0]?.name?.replace(/\.(html?|htm)$/i, "") || "webpage";
    return (
      <DownloadButton
        result={result}
        filename={`${baseName}.pdf`}
        onReset={handleReset}
      />
    );
  }

  return (
    <FileDropzone
      accept=".html,.htm"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop an HTML file to convert to PDF"
    />
  );
}
