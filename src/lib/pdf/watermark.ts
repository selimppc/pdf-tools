import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: { r: number; g: number; b: number };
}

export async function addWatermark(
  file: File,
  options: WatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const totalPages = pdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    page.drawText(options.text, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: options.fontSize,
      font,
      color: rgb(options.color.r, options.color.g, options.color.b),
      opacity: options.opacity,
      rotate: degrees(options.rotation),
    });

    onProgress?.(Math.round(((i + 1) / totalPages) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
