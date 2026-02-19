export async function ocrDocument(
  file: File,
  language: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const Tesseract = await import("tesseract.js");

  let imageBlob: Blob;

  if (file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const bytes = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    imageBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    onProgress?.(20);
  } else {
    imageBlob = file;
    onProgress?.(10);
  }

  const result = await Tesseract.recognize(imageBlob, language, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.(20 + Math.round(m.progress * 75));
      }
    },
  });

  onProgress?.(100);
  return new Blob([result.data.text], { type: "text/plain" });
}
