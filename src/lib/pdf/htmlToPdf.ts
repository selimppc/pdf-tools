import jsPDF from "jspdf";

export async function htmlToPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const html = await file.text();
  onProgress?.(20);

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");
  const bodyText = htmlDoc.body.textContent || "";
  onProgress?.(40);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxY = pageHeight - margin;

  const title = htmlDoc.title;
  let y = margin;

  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, margin, y);
    y += 12;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(bodyText, maxLineWidth);

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > maxY) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;

    if (i % 50 === 0) {
      onProgress?.(40 + Math.round((i / lines.length) * 55));
    }
  }

  onProgress?.(100);
  return doc.output("blob");
}
