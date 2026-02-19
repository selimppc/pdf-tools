import { PDFDocument } from "pdf-lib";

export async function removePages(
  file: File,
  pagesToRemove: number[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);
  const totalPages = sourcePdf.getPageCount();

  const removeSet = new Set(pagesToRemove.map((p) => p - 1));
  const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter(
    (i) => !removeSet.has(i)
  );

  const newPdf = await PDFDocument.create();

  for (let i = 0; i < keepIndices.length; i++) {
    const [page] = await newPdf.copyPages(sourcePdf, [keepIndices[i]]);
    newPdf.addPage(page);
    onProgress?.(Math.round(((i + 1) / keepIndices.length) * 100));
  }

  const resultBytes = await newPdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
