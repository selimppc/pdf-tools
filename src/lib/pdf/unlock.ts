import { PDFDocument } from "pdf-lib";

export async function unlockPdf(
  file: File,
  password: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  onProgress?.(20);

  const sourcePdf = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });
  onProgress?.(50);

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
  pages.forEach((page) => newPdf.addPage(page));
  onProgress?.(80);

  newPdf.setTitle(sourcePdf.getTitle() || "");
  newPdf.setAuthor(sourcePdf.getAuthor() || "");

  const resultBytes = await newPdf.save();
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
