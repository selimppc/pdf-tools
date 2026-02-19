"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { unlockPdf } from "@/lib/pdf/unlock";

type Stage = "upload" | "configure" | "processing" | "done";

export function UnlockTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await unlockPdf(files[0], password, setProgress);
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
    setPassword("");
  };

  if (stage === "processing") {
    return (
      <ProcessingView progress={progress} message="Unlocking your PDF..." />
    );
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename={`unlocked-${files[0]?.name || "document.pdf"}`}
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

        <div>
          <label className="mb-2 block text-sm font-medium">
            PDF Password (if known)
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password or leave blank"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Some PDFs with basic restrictions can be unlocked without a password.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Unlock PDF
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
      label="Drop a password-protected PDF"
    />
  );
}
