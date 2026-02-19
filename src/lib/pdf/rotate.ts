import { PDFDocument, degrees } from "pdf-lib";

export type RotationAngle = 90 | 180 | 270;

export interface RotateOptions {
  angle: RotationAngle;
  pageIndices?: number[];
}

export async function rotatePdf(
  file: File,
  options: RotateOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();

  const pagesToRotate =
    options.pageIndices || Array.from({ length: totalPages }, (_, i) => i);

  for (let i = 0; i < pagesToRotate.length; i++) {
    const pageIndex = pagesToRotate[i];
    if (pageIndex >= 0 && pageIndex < totalPages) {
      const page = pdf.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + options.angle));
    }
    onProgress?.(Math.round(((i + 1) / pagesToRotate.length) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
