"use client";

import { useState, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { mergePdfs } from "@/lib/pdf/merge";

type Stage = "upload" | "processing" | "done";

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  const moveFile = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...files];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setFiles(updated);
    },
    [files]
  );

  const handleProcess = async () => {
    if (files.length < 2) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await mergePdfs(files, setProgress);
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
    return <ProcessingView progress={progress} message="Merging your PDFs..." />;
  }

  if (stage === "done") {
    return (
      <DownloadButton
        result={result}
        filename="merged.pdf"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        accept=".pdf"
        multiple
        files={files}
        onFilesChange={setFiles}
        label="Drop PDF files to merge"
      />

      {files.length >= 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <GripVertical className="mr-1 inline h-4 w-4" />
            Drag files above to reorder, or use the buttons below:
          </p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="max-w-[120px] truncate">{file.name}</span>
                {index > 0 && (
                  <button
                    onClick={() => moveFile(index, index - 1)}
                    className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    &uarr;
                  </button>
                )}
                {index < files.length - 1 && (
                  <button
                    onClick={() => moveFile(index, index + 1)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    &darr;
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleProcess} size="lg" className="w-full sm:w-auto">
            Merge {files.length} PDFs
          </Button>
        </div>
      )}
    </div>
  );
}
