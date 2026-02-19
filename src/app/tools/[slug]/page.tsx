"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { MergeTool } from "@/components/tools/MergeTool";
import { SplitTool } from "@/components/tools/SplitTool";
import { CompressTool } from "@/components/tools/CompressTool";
import { RotateTool } from "@/components/tools/RotateTool";
import { PdfToImageTool } from "@/components/tools/PdfToImageTool";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";

const toolComponents: Record<string, React.ComponentType> = {
  "merge-pdf": MergeTool,
  "split-pdf": SplitTool,
  "compress-pdf": CompressTool,
  "rotate-pdf": RotateTool,
  "pdf-to-jpg": PdfToImageTool,
  "jpg-to-pdf": ImageToPdfTool,
};

export default function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
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
