"use client";

import { notFound } from "next/navigation";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { MergeTool } from "@/components/tools/MergeTool";
import { SplitTool } from "@/components/tools/SplitTool";
import { CompressTool } from "@/components/tools/CompressTool";
import { RotateTool } from "@/components/tools/RotateTool";
import { PdfToImageTool } from "@/components/tools/PdfToImageTool";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";
import { RemovePagesTool } from "@/components/tools/RemovePagesTool";
import { WatermarkTool } from "@/components/tools/WatermarkTool";
import { PageNumbersTool } from "@/components/tools/PageNumbersTool";
import { ProtectTool } from "@/components/tools/ProtectTool";
import { PdfToPngTool } from "@/components/tools/PdfToPngTool";
import { PngToPdfTool } from "@/components/tools/PngToPdfTool";
import { PdfToTextTool } from "@/components/tools/PdfToTextTool";
import { UnlockTool } from "@/components/tools/UnlockTool";
import { OrganizePagesTool } from "@/components/tools/OrganizePagesTool";
import { SignPdfTool } from "@/components/tools/SignPdfTool";
import { AnnotateTool } from "@/components/tools/AnnotateTool";
import { WordToPdfTool } from "@/components/tools/WordToPdfTool";
import { HtmlToPdfTool } from "@/components/tools/HtmlToPdfTool";
import { PdfToWordTool } from "@/components/tools/PdfToWordTool";
import { OcrTool } from "@/components/tools/OcrTool";
import { SummarizeTool } from "@/components/tools/SummarizeTool";

const toolComponents: Record<string, React.ComponentType> = {
  "merge-pdf": MergeTool,
  "split-pdf": SplitTool,
  "compress-pdf": CompressTool,
  "rotate-pdf": RotateTool,
  "pdf-to-jpg": PdfToImageTool,
  "jpg-to-pdf": ImageToPdfTool,
  "remove-pages": RemovePagesTool,
  "add-watermark": WatermarkTool,
  "page-numbers": PageNumbersTool,
  "protect-pdf": ProtectTool,
  "pdf-to-png": PdfToPngTool,
  "png-to-pdf": PngToPdfTool,
  "pdf-to-text": PdfToTextTool,
  "unlock-pdf": UnlockTool,
  "organize-pages": OrganizePagesTool,
  "sign-pdf": SignPdfTool,
  "annotate-pdf": AnnotateTool,
  "word-to-pdf": WordToPdfTool,
  "html-to-pdf": HtmlToPdfTool,
  "pdf-to-word": PdfToWordTool,
  "ocr-pdf": OcrTool,
  "summarize-pdf": SummarizeTool,
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
      <ToolComponent />
    </ToolPageShell>
  );
}
