export async function summarizePdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const totalPages = pdf.numPages;
  const allText: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    allText.push(pageText);
    onProgress?.(Math.round((i / totalPages) * 60));
  }

  const fullText = allText.join("\n\n");
  onProgress?.(70);

  const sentences = fullText
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const wordFreq: Record<string, number> = {};
  const words = fullText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const stopWords = new Set([
    "that", "this", "with", "from", "have", "been", "will", "would",
    "could", "should", "their", "there", "about", "which", "when",
    "what", "were", "your", "they", "some", "other", "than", "then",
    "also", "into", "more", "only", "each", "very", "just",
  ]);

  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  const scoredSentences = sentences.map((sentence) => {
    const sentWords = sentence.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const score = sentWords.reduce(
      (sum, w) => sum + (wordFreq[w] || 0),
      0
    ) / Math.max(sentWords.length, 1);
    return { sentence, score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  onProgress?.(85);

  const summaryCount = Math.min(
    Math.max(5, Math.floor(sentences.length * 0.1)),
    20
  );
  const topSentences = scoredSentences.slice(0, summaryCount);

  topSentences.sort(
    (a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)
  );

  const stats = [
    `📄 Document Statistics`,
    `   Pages: ${totalPages}`,
    `   Total words: ${words.length.toLocaleString()}`,
    `   Sentences: ${sentences.length.toLocaleString()}`,
    ``,
    `📝 Key Summary (${summaryCount} key sentences):`,
    ``,
  ];

  const summary =
    stats.join("\n") +
    topSentences.map((s, i) => `${i + 1}. ${s.sentence}.`).join("\n\n") +
    "\n\n---\n\nTop Keywords: " +
    Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => `${word} (${count})`)
      .join(", ");

  onProgress?.(100);
  return new Blob([summary], { type: "text/plain" });
}
