import jsPDF from "jspdf";
import mammoth from "mammoth";

export async function wordToPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(20);

  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  onProgress?.(40);

  // Parse HTML to extract structured content
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const maxLineWidth = pageWidth - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxY = pageHeight - margin;
  let y = margin;

  const addNewPage = () => {
    doc.addPage();
    y = margin;
  };

  const renderText = (
    text: string,
    fontSize: number,
    fontStyle: string,
    lineSpacing: number,
    spacingAfter: number
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(text.trim(), maxLineWidth);

    for (const line of lines) {
      if (y + lineSpacing > maxY) addNewPage();
      doc.text(line, margin, y);
      y += lineSpacing;
    }
    y += spacingAfter;
  };

  const children = htmlDoc.body.children;
  const total = children.length;

  for (let i = 0; i < total; i++) {
    const el = children[i];
    const tag = el.tagName.toLowerCase();
    const text = el.textContent || "";

    if (!text.trim()) continue;

    switch (tag) {
      case "h1":
        renderText(text, 18, "bold", 8, 4);
        break;
      case "h2":
        renderText(text, 15, "bold", 7, 3);
        break;
      case "h3":
        renderText(text, 13, "bold", 6.5, 2.5);
        break;
      case "h4":
      case "h5":
      case "h6":
        renderText(text, 11.5, "bold", 6, 2);
        break;
      default:
        renderText(text, 11, "normal", 5.5, 2.5);
        break;
    }

    if (i % 20 === 0) {
      onProgress?.(40 + Math.round((i / total) * 55));
    }
  }

  onProgress?.(100);
  return doc.output("blob");
}
