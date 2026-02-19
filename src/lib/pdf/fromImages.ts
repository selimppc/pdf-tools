import { PDFDocument } from "pdf-lib";

async function reEncodePng(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          const ab = await blob.arrayBuffer();
          resolve(new Uint8Array(ab));
        },
        "image/png"
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "portrait" | "landscape" | "auto";
export type ImageQuality = "standard" | "high" | "maximum";

const PAGE_SIZES = {
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
    const ext = file.name.toLowerCase().split(".").pop();
    const isPng = type === "image/png" || ext === "png";

    if (isPng) {
      try {
        image = await pdf.embedPng(uint8);
      } catch {
        const cleanPng = await reEncodePng(file);
        image = await pdf.embedPng(cleanPng);
      }
    } else {
      image = await pdf.embedJpg(uint8);
    }

    const imgW = image.width;
    const imgH = image.height;
    const isLandscapeImage = imgW > imgH;

    if (options.pageSize === "fit") {
      // Smart "fit" mode: use A4-sized page with auto orientation,
      // filling the page with the image while keeping all pixel data.
      // This produces a normal-sized PDF that looks good on screen.
      const base = PAGE_SIZES.a4;
      const pageWidth = isLandscapeImage ? base.height : base.width;
      const pageHeight = isLandscapeImage ? base.width : base.height;

      const page = pdf.addPage([pageWidth, pageHeight]);

      // Scale image to fill the page (with small margins)
      const fitMargin = 18;
      const usableW = pageWidth - fitMargin * 2;
      const usableH = pageHeight - fitMargin * 2;

      const imgAspect = imgW / imgH;
      const areaAspect = usableW / usableH;
      let drawW: number, drawH: number;

      if (imgAspect > areaAspect) {
        drawW = usableW;
        drawH = usableW / imgAspect;
      } else {
        drawH = usableH;
        drawW = usableH * imgAspect;
      }

      const x = fitMargin + (usableW - drawW) / 2;
      const y = fitMargin + (usableH - drawH) / 2;

      page.drawImage(image, { x, y, width: drawW, height: drawH });
    } else {
      const size = PAGE_SIZES[options.pageSize];
      let pageWidth: number, pageHeight: number;

      if (options.orientation === "auto") {
        pageWidth = isLandscapeImage ? size.height : size.width;
        pageHeight = isLandscapeImage ? size.width : size.height;
      } else if (options.orientation === "landscape") {
        pageWidth = size.height;
        pageHeight = size.width;
      } else {
        pageWidth = size.width;
        pageHeight = size.height;
      }

      const page = pdf.addPage([pageWidth, pageHeight]);

      const usableW = pageWidth - margin * 2;
      const usableH = pageHeight - margin * 2;

      const imgAspect = imgW / imgH;
      const areaAspect = usableW / usableH;
      let drawW: number, drawH: number;

      if (imgAspect > areaAspect) {
        drawW = usableW;
        drawH = usableW / imgAspect;
      } else {
        drawH = usableH;
        drawW = usableH * imgAspect;
      }

      const x = margin + (usableW - drawW) / 2;
      const y = margin + (usableH - drawH) / 2;

      page.drawImage(image, { x, y, width: drawW, height: drawH });
    }

    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const resultBytes = await pdf.save();
  return new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
