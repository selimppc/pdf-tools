"use client";

import { useState, useCallback, useRef } from "react";

interface UseProcessingOptions<T> {
  processor: (
    files: File[],
    options: T,
    onProgress: (progress: number) => void
  ) => Promise<Blob>;
}

interface ProcessingState {
  stage: "idle" | "processing" | "done" | "error";
  progress: number;
  result: Blob | null;
  error: string | null;
}

export function useProcessing<T>({ processor }: UseProcessingOptions<T>) {
  const [state, setState] = useState<ProcessingState>({
    stage: "idle",
    progress: 0,
    result: null,
    error: null,
  });
  const abortRef = useRef(false);

  const process = useCallback(
    async (files: File[], options: T) => {
      abortRef.current = false;
      setState({ stage: "processing", progress: 0, result: null, error: null });

      try {
        const blob = await processor(files, options, (progress) => {
          if (!abortRef.current) {
            setState((prev) => ({ ...prev, progress }));
          }
        });

        if (!abortRef.current) {
          setState({ stage: "done", progress: 100, result: blob, error: null });
        }
      } catch (err) {
        if (!abortRef.current) {
          const message =
            err instanceof Error ? err.message : "Processing failed";
          console.error("Processing error:", err);
          setState({
            stage: "error",
            progress: 0,
            result: null,
            error: message,
          });
        }
      }
    },
    [processor]
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ stage: "idle", progress: 0, result: null, error: null });
  }, []);

  return { ...state, process, reset };
}
