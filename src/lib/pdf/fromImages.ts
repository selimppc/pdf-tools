import { PDFDocument } from "pdf-lib";

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "portrait" | "landscape";

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export async function imagesToPdf(
  files: File[],
  options: { pageSize: PageSize; orientation: Orientation },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const total = files.length;

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
      pageWidth = image.width;
      pageHeight = image.height;
    } else {
      const size = PAGE_SIZES[options.pageSize];
      if (options.orientation === "landscape") {
        pageWidth = size.height;
        pageHeight = size.width;
      } else {
        pageWidth = size.width;
        pageHeight = size.height;
      }
    }

    const page = pdf.addPage([pageWidth, pageHeight]);

    if (options.pageSize === "fit") {
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } else {
      const imgAspect = image.width / image.height;
      const pageAspect = pageWidth / pageHeight;

      let drawWidth: number;
      let drawHeight: number;

      if (imgAspect > pageAspect) {
        drawWidth = pageWidth;
        drawHeight = pageWidth / imgAspect;
      } else {
        drawHeight = pageHeight;
        drawWidth = pageHeight * imgAspect;
      }

      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }

    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
