import jsPDF from "jspdf";

export async function htmlToPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const html = await file.text();
  onProgress?.(20);

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");
  onProgress?.(30);

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

  // Render title
  const title = htmlDoc.title;
  if (title) {
    renderText(title, 20, "bold", 9, 6);
  }

  // Process all content elements
  const elements = htmlDoc.body.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, li, td, th, pre, blockquote, div"
  );
  const total = elements.length;

  for (let i = 0; i < total; i++) {
    const el = elements[i];
    const text = el.textContent || "";
    if (!text.trim()) continue;

    // Skip children of elements we'll process
    if (el.parentElement?.tagName === "LI") continue;

    const tag = el.tagName.toLowerCase();

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
      case "li":
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const bulletLines = doc.splitTextToSize(`•  ${text.trim()}`, maxLineWidth - 5);
        for (const line of bulletLines) {
          if (y + 5.5 > maxY) addNewPage();
          doc.text(line, margin + 3, y);
          y += 5.5;
        }
        y += 1;
        break;
      case "pre":
        doc.setFontSize(9);
        doc.setFont("courier", "normal");
        const codeLines = doc.splitTextToSize(text.trim(), maxLineWidth);
        for (const line of codeLines) {
          if (y + 4.5 > maxY) addNewPage();
          doc.text(line, margin, y);
          y += 4.5;
        }
        doc.setFont("helvetica", "normal");
        y += 3;
        break;
      case "blockquote":
        renderText(`"${text.trim()}"`, 11, "italic", 5.5, 3);
        break;
      default:
        renderText(text, 11, "normal", 5.5, 2.5);
        break;
    }

    if (i % 20 === 0) {
      onProgress?.(30 + Math.round((i / total) * 65));
    }
  }

  onProgress?.(100);
  return doc.output("blob");
}
