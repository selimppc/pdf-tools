"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
}

export function FileDropzone({
  accept,
  multiple = false,
  files,
  onFilesChange,
  maxFiles = 50,
  label,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (multiple) {
        const combined = [...files, ...dropped].slice(0, maxFiles);
        onFilesChange(combined);
      } else {
        onFilesChange(dropped.slice(0, 1));
      }
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (multiple) {
        const combined = [...files, ...selected].slice(0, maxFiles);
        onFilesChange(combined);
      } else {
        onFilesChange(selected.slice(0, 1));
      }
      e.target.value = "";
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length > 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {multiple && files.length < maxFiles && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
            <Plus className="h-4 w-4" />
            Add more files
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 sm:p-16",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <motion.div
        animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
      >
        <Upload className="h-7 w-7 text-primary" />
      </motion.div>
      <div className="text-center">
        <p className="text-lg font-medium">
          {label || "Drop your files here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse &middot; {accept.replace(/\./g, "").toUpperCase()}{" "}
          {multiple ? `files (up to ${maxFiles})` : "file"}
        </p>
      </div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </label>
  );
}
