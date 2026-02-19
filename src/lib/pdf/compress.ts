import { PDFDocument } from "pdf-lib";

export type CompressionLevel = "low" | "medium" | "high";

export async function compressPdf(
  file: File,
  level: CompressionLevel = "medium",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  onProgress?.(20);

  const sourcePdf = await PDFDocument.load(bytes);
  onProgress?.(40);

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
  pages.forEach((page) => newPdf.addPage(page));
  onProgress?.(60);

  const useObjectStreams = level === "high" || level === "medium";

  newPdf.setTitle(sourcePdf.getTitle() || "");
  newPdf.setAuthor(sourcePdf.getAuthor() || "");
  onProgress?.(80);

  const resultBytes = await newPdf.save({
    useObjectStreams,
    addDefaultPage: false,
    objectsPerTick: level === "high" ? 20 : 50,
  });
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
