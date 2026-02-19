"use client";

import { Suspense, lazy } from "react";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { Loader2 } from "lucide-react";

function ToolLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      <p className="text-sm text-muted-foreground">Loading tool...</p>
    </div>
  );
}

const toolComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "merge-pdf": lazy(() => import("@/components/tools/MergeTool").then((m) => ({ default: m.MergeTool }))),
  "split-pdf": lazy(() => import("@/components/tools/SplitTool").then((m) => ({ default: m.SplitTool }))),
  "compress-pdf": lazy(() => import("@/components/tools/CompressTool").then((m) => ({ default: m.CompressTool }))),
  "rotate-pdf": lazy(() => import("@/components/tools/RotateTool").then((m) => ({ default: m.RotateTool }))),
  "pdf-to-jpg": lazy(() => import("@/components/tools/PdfToImageTool").then((m) => ({ default: m.PdfToImageTool }))),
  "jpg-to-pdf": lazy(() => import("@/components/tools/ImageToPdfTool").then((m) => ({ default: m.ImageToPdfTool }))),
  "remove-pages": lazy(() => import("@/components/tools/RemovePagesTool").then((m) => ({ default: m.RemovePagesTool }))),
  "add-watermark": lazy(() => import("@/components/tools/WatermarkTool").then((m) => ({ default: m.WatermarkTool }))),
  "page-numbers": lazy(() => import("@/components/tools/PageNumbersTool").then((m) => ({ default: m.PageNumbersTool }))),
  "protect-pdf": lazy(() => import("@/components/tools/ProtectTool").then((m) => ({ default: m.ProtectTool }))),
  "pdf-to-png": lazy(() => import("@/components/tools/PdfToPngTool").then((m) => ({ default: m.PdfToPngTool }))),
  "png-to-pdf": lazy(() => import("@/components/tools/PngToPdfTool").then((m) => ({ default: m.PngToPdfTool }))),
  "pdf-to-text": lazy(() => import("@/components/tools/PdfToTextTool").then((m) => ({ default: m.PdfToTextTool }))),
  "unlock-pdf": lazy(() => import("@/components/tools/UnlockTool").then((m) => ({ default: m.UnlockTool }))),
  "organize-pages": lazy(() => import("@/components/tools/OrganizePagesTool").then((m) => ({ default: m.OrganizePagesTool }))),
  "sign-pdf": lazy(() => import("@/components/tools/SignPdfTool").then((m) => ({ default: m.SignPdfTool }))),
  "annotate-pdf": lazy(() => import("@/components/tools/AnnotateTool").then((m) => ({ default: m.AnnotateTool }))),
  "word-to-pdf": lazy(() => import("@/components/tools/WordToPdfTool").then((m) => ({ default: m.WordToPdfTool }))),
  "html-to-pdf": lazy(() => import("@/components/tools/HtmlToPdfTool").then((m) => ({ default: m.HtmlToPdfTool }))),
  "pdf-to-word": lazy(() => import("@/components/tools/PdfToWordTool").then((m) => ({ default: m.PdfToWordTool }))),
  "ocr-pdf": lazy(() => import("@/components/tools/OcrTool").then((m) => ({ default: m.OcrTool }))),
  "summarize-pdf": lazy(() => import("@/components/tools/SummarizeTool").then((m) => ({ default: m.SummarizeTool }))),
};

export function ToolClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);

  if (!tool || !tool.implemented) {
    notFound();
  }

  const ToolComponent = toolComponents[slug];

  if (!ToolComponent) {
    notFound();
  }

  return (
    <ToolPageShell tool={tool}>
      <Suspense fallback={<ToolLoading />}>
        <ToolComponent />
      </Suspense>
    </ToolPageShell>
  );
}
