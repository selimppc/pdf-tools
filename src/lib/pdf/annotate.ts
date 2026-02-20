import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface TextAnnotation {
  type: "text";
  text: string;
  page: number;
  xRatio: number;
  yRatio: number;
  fontSize: number;
  color: { r: number; g: number; b: number };
}

export interface HighlightAnnotation {
  type: "highlight";
  page: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  color: { r: number; g: number; b: number };
  opacity: number;
}

export interface DrawAnnotation {
  type: "draw";
  page: number;
  points: { xRatio: number; yRatio: number }[];
  color: { r: number; g: number; b: number };
  lineWidth: number;
}

export type Annotation = TextAnnotation | HighlightAnnotation | DrawAnnotation;

export async function annotatePdf(
  file: File,
  annotations: Annotation[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  onProgress?.(20);

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i];
    const page = pdf.getPage(ann.page);
    const { width: pageW, height: pageH } = page.getSize();

    if (ann.type === "text") {
      page.drawText(ann.text, {
        x: ann.xRatio * pageW,
        y: pageH - ann.yRatio * pageH,
        size: ann.fontSize,
        font,
        color: rgb(ann.color.r, ann.color.g, ann.color.b),
      });
    } else if (ann.type === "highlight") {
      page.drawRectangle({
        x: ann.xRatio * pageW,
        y: pageH - ann.yRatio * pageH - ann.heightRatio * pageH,
        width: ann.widthRatio * pageW,
        height: ann.heightRatio * pageH,
        color: rgb(ann.color.r, ann.color.g, ann.color.b),
        opacity: ann.opacity,
      });
    } else if (ann.type === "draw") {
      if (ann.points.length < 2) continue;
      const svgParts: string[] = [];
      svgParts.push(
        `M ${ann.points[0].xRatio * pageW} ${pageH - ann.points[0].yRatio * pageH}`
      );
      for (let j = 1; j < ann.points.length; j++) {
        svgParts.push(
          `L ${ann.points[j].xRatio * pageW} ${pageH - ann.points[j].yRatio * pageH}`
        );
      }
      page.drawSvgPath(svgParts.join(" "), {
        borderColor: rgb(ann.color.r, ann.color.g, ann.color.b),
        borderWidth: ann.lineWidth,
        color: undefined,
      });
    }

    onProgress?.(20 + Math.round(((i + 1) / annotations.length) * 75));
  }

  const resultBytes = await pdf.save();
  onProgress?.(100);

  return new Blob([resultBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
}
