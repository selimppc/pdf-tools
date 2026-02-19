import JSZip from "jszip";

export interface ToImagesOptions {
  format: "jpeg" | "png";
  quality: number;
  scale: number;
}

export async function pdfToImages(
  file: File,
  options: ToImagesOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const totalPages = pdf.numPages;

  const zip = new JSZip();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: options.scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const ctx = canvas.getContext("2d", {
      alpha: options.format === "png",
      willReadFrequently: false,
    })!;

    if (options.format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // High-quality rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        `image/${options.format}`,
        options.quality
      );
    });

    const ext = options.format === "jpeg" ? "jpg" : "png";
    const pageNum = String(i).padStart(String(totalPages).length, "0");
    zip.file(`page-${pageNum}.${ext}`, blob);

    canvas.width = 0;
    canvas.height = 0;

    onProgress?.(Math.round((i / totalPages) * 100));
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}
