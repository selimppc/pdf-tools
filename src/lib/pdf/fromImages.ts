import { PDFDocument } from "pdf-lib";

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "portrait" | "landscape";
export type ImageQuality = "standard" | "high" | "maximum";

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export interface ImageToPdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  quality: ImageQuality;
  margin: number;
}

export async function imagesToPdf(
  files: File[],
  options: ImageToPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const total = files.length;
  const margin = options.margin ?? 0;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    let image;
    const type = file.type.toLowerCase();

    if (type === "image/png") {
      image = await pdf.embedPng(uint8);
    } else {
      image = await pdf.embedJpg(uint8);
    }

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === "fit") {
      // 1 pixel = 1 PDF point: preserves every pixel at 100% zoom.
      // The full image data is embedded losslessly; no resampling occurs.
      pageWidth = image.width;
      pageHeight = image.height;

      const page = pdf.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } else {
      const size = PAGE_SIZES[options.pageSize];
      if (options.orientation === "landscape") {
        pageWidth = size.height;
        pageHeight = size.width;
      } else {
        pageWidth = size.width;
        pageHeight = size.height;
      }

      const page = pdf.addPage([pageWidth, pageHeight]);

      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const imgAspect = image.width / image.height;
      const areaAspect = usableWidth / usableHeight;

      let drawWidth: number;
      let drawHeight: number;

      if (imgAspect > areaAspect) {
        drawWidth = usableWidth;
        drawHeight = usableWidth / imgAspect;
      } else {
        drawHeight = usableHeight;
        drawWidth = usableHeight * imgAspect;
      }

      const x = margin + (usableWidth - drawWidth) / 2;
      const y = margin + (usableHeight - drawHeight) / 2;

      page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
    }

    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
