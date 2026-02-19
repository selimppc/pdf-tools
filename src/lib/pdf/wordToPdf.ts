import jsPDF from "jspdf";
import mammoth from "mammoth";

export async function wordToPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(20);

  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  onProgress?.(50);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxY = pageHeight - margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(text, maxLineWidth);
  let y = margin;

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > maxY) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;

    if (i % 50 === 0) {
      onProgress?.(50 + Math.round((i / lines.length) * 45));
    }
  }

  onProgress?.(100);
  return doc.output("blob");
}
