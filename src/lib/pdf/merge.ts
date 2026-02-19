import { PDFDocument } from "pdf-lib";

export async function mergePdfs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const bytes = await files[i].arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
