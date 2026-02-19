import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type NumberPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export interface PageNumberOptions {
  position: NumberPosition;
  fontSize: number;
  startNumber: number;
  format: "number" | "page-of-total";
}

export async function addPageNumbers(
  file: File,
  options: PageNumberOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const totalPages = pdf.getPageCount();
  const margin = 40;

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = options.startNumber + i;

    const text =
      options.format === "page-of-total"
        ? `Page ${pageNum} of ${totalPages + options.startNumber - 1}`
        : `${pageNum}`;

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);

    let x: number;
    let y: number;

    switch (options.position) {
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-center":
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case "bottom-right":
        x = width - textWidth - margin;
        y = margin;
        break;
      case "top-left":
        x = margin;
        y = height - margin;
        break;
      case "top-center":
        x = (width - textWidth) / 2;
        y = height - margin;
        break;
      case "top-right":
        x = width - textWidth - margin;
        y = height - margin;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    onProgress?.(Math.round(((i + 1) / totalPages) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
