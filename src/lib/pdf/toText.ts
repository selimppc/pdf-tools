export async function pdfToText(
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
    textParts.push(`--- Page ${i} ---\n${pageText}`);
    onProgress?.(Math.round((i / totalPages) * 100));
  }

  const fullText = textParts.join("\n\n");
  return new Blob([fullText], { type: "text/plain" });
}
