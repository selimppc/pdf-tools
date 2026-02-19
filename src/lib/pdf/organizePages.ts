import { PDFDocument } from "pdf-lib";

export async function organizePages(
  file: File,
  newOrder: number[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < newOrder.length; i++) {
    const [page] = await newPdf.copyPages(sourcePdf, [newOrder[i]]);
    newPdf.addPage(page);
    onProgress?.(Math.round(((i + 1) / newOrder.length) * 100));
  }

  const resultBytes = await newPdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
