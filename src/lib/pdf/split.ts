import { PDFDocument } from "pdf-lib";

export interface SplitOptions {
  mode: "ranges" | "extract";
  ranges?: { from: number; to: number }[];
  pages?: number[];
}

export async function splitPdf(
  file: File,
  options: SplitOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);
  const totalPages = sourcePdf.getPageCount();

  let pageIndices: number[];

  if (options.mode === "extract" && options.pages) {
    pageIndices = options.pages
      .filter((p) => p >= 1 && p <= totalPages)
      .map((p) => p - 1);
  } else if (options.mode === "ranges" && options.ranges) {
    pageIndices = [];
    for (const range of options.ranges) {
      const from = Math.max(1, range.from);
      const to = Math.min(totalPages, range.to);
      for (let i = from; i <= to; i++) {
        if (!pageIndices.includes(i - 1)) {
          pageIndices.push(i - 1);
        }
      }
    }
  } else {
    pageIndices = sourcePdf.getPageIndices();
  }

  const newPdf = await PDFDocument.create();
  const total = pageIndices.length;

  for (let i = 0; i < total; i++) {
    const [page] = await newPdf.copyPages(sourcePdf, [pageIndices[i]]);
    newPdf.addPage(page);
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const resultBytes = await newPdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
}
