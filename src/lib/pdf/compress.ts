import { PDFDocument } from "pdf-lib";

export type CompressionLevel = "low" | "medium" | "high";

const SETTINGS: Record<
  CompressionLevel,
  { scale: number; quality: number; useObjectStreams: boolean }
> = {
  low: { scale: 1.5, quality: 0.85, useObjectStreams: true },
  medium: { scale: 1.2, quality: 0.7, useObjectStreams: true },
  high: { scale: 0.9, quality: 0.5, useObjectStreams: true },
};

export async function compressPdf(
  file: File,
  level: CompressionLevel = "medium",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  onProgress?.(5);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const srcDoc = await pdfjs.getDocument({ data: bytes }).promise;
  const numPages = srcDoc.numPages;
  const { scale, quality, useObjectStreams } = SETTINGS[level];
  onProgress?.(10);

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await srcDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const imgResponse = await fetch(dataUrl);
    const imgBytes = new Uint8Array(await imgResponse.arrayBuffer());
    const img = await newPdf.embedJpg(imgBytes);

    const origViewport = page.getViewport({ scale: 1 });
    const pdfPage = newPdf.addPage([origViewport.width, origViewport.height]);
    pdfPage.drawImage(img, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    canvas.width = 0;
    canvas.height = 0;

    onProgress?.(10 + Math.round((i / numPages) * 85));
  }

  const resultBytes = await newPdf.save({
    useObjectStreams,
    addDefaultPage: false,
  });
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
