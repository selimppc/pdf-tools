import { PDFDocument } from "pdf-lib";

export interface SignaturePosition {
  /** X offset as fraction of page width (0-1) */
  xRatio: number;
  /** Y offset as fraction of page height (0-1) */
  yRatio: number;
  /** Width as fraction of page width */
  widthRatio: number;
  /** Height as fraction of page height */
  heightRatio: number;
}

export type PageTarget = "current" | "all" | number[];

export interface SignPdfOptions {
  signatureDataUrl: string;
  position: SignaturePosition;
  currentPage: number;
  pageTarget: PageTarget;
}

export async function signPdf(
  file: File,
  options: SignPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  onProgress?.(10);

  const pdf = await PDFDocument.load(bytes);
  onProgress?.(25);

  const response = await fetch(options.signatureDataUrl);
  const sigBytes = new Uint8Array(await response.arrayBuffer());

  let signatureImage;
  try {
    signatureImage = await pdf.embedPng(sigBytes);
  } catch {
    signatureImage = await pdf.embedJpg(sigBytes);
  }
  onProgress?.(40);

  const totalPages = pdf.getPageCount();
  let targetPages: number[];

  if (options.pageTarget === "all") {
    targetPages = Array.from({ length: totalPages }, (_, i) => i);
  } else if (options.pageTarget === "current") {
    targetPages = [options.currentPage];
  } else {
    targetPages = options.pageTarget.filter((p) => p >= 0 && p < totalPages);
  }

  for (let i = 0; i < targetPages.length; i++) {
    const pageIdx = targetPages[i];
    const page = pdf.getPage(pageIdx);
    const { width: pageW, height: pageH } = page.getSize();

    const sigW = options.position.widthRatio * pageW;
    const sigH = options.position.heightRatio * pageH;
    const sigX = options.position.xRatio * pageW;
    const sigY = pageH - options.position.yRatio * pageH - sigH;

    page.drawImage(signatureImage, {
      x: sigX,
      y: sigY,
      width: sigW,
      height: sigH,
    });

    onProgress?.(40 + Math.round(((i + 1) / targetPages.length) * 55));
  }

  const resultBytes = await pdf.save();
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
