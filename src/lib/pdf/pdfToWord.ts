export async function pdfToWord(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const totalPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
    onProgress?.(Math.round((i / totalPages) * 80));
  }

  const fullText = textParts.join("\n\n");
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>Converted PDF</title></head>
    <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;">
    ${fullText
      .split("\n\n")
      .map((p) => `<p>${p}</p>`)
      .join("\n")}
    </body></html>`;

  onProgress?.(100);

  return new Blob([htmlContent], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
