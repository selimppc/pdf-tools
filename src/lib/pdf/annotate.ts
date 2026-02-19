import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface TextAnnotation {
  text: string;
  page: number;
  x: number;
  y: number;
  fontSize: number;
  color: { r: number; g: number; b: number };
}

export async function annotatePdf(
  file: File,
  annotations: TextAnnotation[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  onProgress?.(30);

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i];
    const page = pdf.getPage(ann.page);
    const { height } = page.getSize();

    page.drawText(ann.text, {
      x: ann.x,
      y: height - ann.y,
      size: ann.fontSize,
      font,
      color: rgb(ann.color.r, ann.color.g, ann.color.b),
    });
    onProgress?.(30 + Math.round(((i + 1) / annotations.length) * 60));
  }

  const resultBytes = await pdf.save();
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
