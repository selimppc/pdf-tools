import { PDFDocument } from "pdf-lib";

export async function signPdf(
  file: File,
  signatureDataUrl: string,
  position: { x: number; y: number; width: number; height: number; page: number },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  onProgress?.(20);

  const pdf = await PDFDocument.load(bytes);
  onProgress?.(40);

  const signatureResponse = await fetch(signatureDataUrl);
  const signatureBytes = new Uint8Array(await signatureResponse.arrayBuffer());
  const signatureImage = await pdf.embedPng(signatureBytes);
  onProgress?.(60);

  const page = pdf.getPage(position.page);
  const { height: pageHeight } = page.getSize();

  page.drawImage(signatureImage, {
    x: position.x,
    y: pageHeight - position.y - position.height,
    width: position.width,
    height: position.height,
  });
  onProgress?.(80);

  const resultBytes = await pdf.save();
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
