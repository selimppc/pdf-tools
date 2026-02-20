"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "./FileDropzone";
import { ProcessingView } from "./ProcessingView";
import { DownloadButton } from "./DownloadButton";
import { ocrDocument } from "@/lib/pdf/ocr";

type Stage = "upload" | "configure" | "processing" | "done";

const LANGUAGES = [
  { value: "eng", label: "English", region: "Popular" },
  { value: "spa", label: "Spanish", region: "Popular" },
  { value: "fra", label: "French", region: "Popular" },
  { value: "deu", label: "German", region: "Popular" },
  { value: "por", label: "Portuguese", region: "Popular" },
  { value: "ita", label: "Italian", region: "Popular" },
  { value: "nld", label: "Dutch", region: "Popular" },
  { value: "rus", label: "Russian", region: "Popular" },
  { value: "chi_sim", label: "Chinese (Simplified)", region: "Popular" },
  { value: "chi_tra", label: "Chinese (Traditional)", region: "Popular" },
  { value: "jpn", label: "Japanese", region: "Popular" },
  { value: "kor", label: "Korean", region: "Popular" },
  { value: "ara", label: "Arabic", region: "Popular" },
  { value: "hin", label: "Hindi", region: "Popular" },
  { value: "ben", label: "Bengali", region: "South Asia" },
  { value: "urd", label: "Urdu", region: "South Asia" },
  { value: "tam", label: "Tamil", region: "South Asia" },
  { value: "tel", label: "Telugu", region: "South Asia" },
  { value: "mar", label: "Marathi", region: "South Asia" },
  { value: "guj", label: "Gujarati", region: "South Asia" },
  { value: "kan", label: "Kannada", region: "South Asia" },
  { value: "mal", label: "Malayalam", region: "South Asia" },
  { value: "pan", label: "Punjabi", region: "South Asia" },
  { value: "nep", label: "Nepali", region: "South Asia" },
  { value: "sin", label: "Sinhala", region: "South Asia" },
  { value: "tha", label: "Thai", region: "Southeast Asia" },
  { value: "vie", label: "Vietnamese", region: "Southeast Asia" },
  { value: "msa", label: "Malay", region: "Southeast Asia" },
  { value: "ind", label: "Indonesian", region: "Southeast Asia" },
  { value: "mya", label: "Myanmar (Burmese)", region: "Southeast Asia" },
  { value: "khm", label: "Khmer", region: "Southeast Asia" },
  { value: "lao", label: "Lao", region: "Southeast Asia" },
  { value: "fil", label: "Filipino", region: "Southeast Asia" },
  { value: "tur", label: "Turkish", region: "Europe" },
  { value: "pol", label: "Polish", region: "Europe" },
  { value: "ukr", label: "Ukrainian", region: "Europe" },
  { value: "ron", label: "Romanian", region: "Europe" },
  { value: "ces", label: "Czech", region: "Europe" },
  { value: "ell", label: "Greek", region: "Europe" },
  { value: "hun", label: "Hungarian", region: "Europe" },
  { value: "bul", label: "Bulgarian", region: "Europe" },
  { value: "hrv", label: "Croatian", region: "Europe" },
  { value: "srp", label: "Serbian", region: "Europe" },
  { value: "slk", label: "Slovak", region: "Europe" },
  { value: "slv", label: "Slovenian", region: "Europe" },
  { value: "lit", label: "Lithuanian", region: "Europe" },
  { value: "lav", label: "Latvian", region: "Europe" },
  { value: "est", label: "Estonian", region: "Europe" },
  { value: "fin", label: "Finnish", region: "Europe" },
  { value: "swe", label: "Swedish", region: "Europe" },
  { value: "nor", label: "Norwegian", region: "Europe" },
  { value: "dan", label: "Danish", region: "Europe" },
  { value: "cat", label: "Catalan", region: "Europe" },
  { value: "gle", label: "Irish", region: "Europe" },
  { value: "isl", label: "Icelandic", region: "Europe" },
  { value: "heb", label: "Hebrew", region: "Middle East" },
  { value: "fas", label: "Persian (Farsi)", region: "Middle East" },
  { value: "pus", label: "Pashto", region: "Middle East" },
  { value: "kur", label: "Kurdish", region: "Middle East" },
  { value: "swa", label: "Swahili", region: "Africa" },
  { value: "amh", label: "Amharic", region: "Africa" },
  { value: "afr", label: "Afrikaans", region: "Africa" },
  { value: "kat", label: "Georgian", region: "Other" },
  { value: "hye", label: "Armenian", region: "Other" },
  { value: "kaz", label: "Kazakh", region: "Other" },
  { value: "uzb", label: "Uzbek", region: "Other" },
  { value: "mon", label: "Mongolian", region: "Other" },
  { value: "tib", label: "Tibetan", region: "Other" },
];

export function OcrTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const filteredLangs = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.value.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof LANGUAGES>();
    for (const l of filteredLangs) {
      const arr = map.get(l.region) || [];
      arr.push(l);
      map.set(l.region, arr);
    }
    return map;
  }, [filteredLangs]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setStage("configure");
  };

  const handleProcess = async () => {
    if (files.length !== 1) return;
    setStage("processing");
    setProgress(0);
    try {
      const blob = await ocrDocument(files[0], language, setProgress);
      setResult(blob);
      const text = await blob.text();
      setPreview(text);
      setStage("done");
    } catch {
      setStage("configure");
    }
  };

  const handleCopy = async () => {
    if (preview) {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setResult(null);
    setPreview("");
    setCopied(false);
    setSearch("");
  };

  if (stage === "processing") {
    return (
      <ProcessingView
        progress={progress}
        message="Running OCR (this may take a moment)..."
      />
    );
  }

  if (stage === "done") {
    const baseName = files[0]?.name?.replace(/\.[^.]+$/, "") || "ocr-result";
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="max-h-80 overflow-y-auto rounded-xl border border-border/50 bg-muted/30 p-5 font-mono text-sm leading-relaxed">
            {preview.slice(0, 5000)}
            {preview.length > 5000 && (
              <p className="mt-4 text-muted-foreground">
                ... {preview.length - 5000} more characters
              </p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-lg border border-border/50 bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <DownloadButton
          result={result}
          filename={`${baseName}-ocr.txt`}
          onReset={handleReset}
        />
      </div>
    );
  }

  if (stage === "configure") {
    const selectedLang = LANGUAGES.find((l) => l.value === language);

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-medium">{files[0]?.name}</p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-muted-foreground">
          OCR runs{" "}
          <strong className="text-cyan-600 dark:text-cyan-400">
            100% in your browser
          </strong>{" "}
          using Tesseract.js. No data leaves your device. First run downloads
          language data (~2-15MB depending on language).
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">
              Document Language
            </label>
            {selectedLang && (
              <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {selectedLang.label}
              </span>
            )}
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="pl-9"
            />
          </div>

          {/* Language grid grouped by region */}
          <div className="max-h-64 space-y-4 overflow-y-auto rounded-xl border border-border/50 bg-muted/10 p-4">
            {Array.from(grouped.entries()).map(([region, langs]) => (
              <div key={region}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {region}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {langs.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLanguage(l.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                        language === l.value
                          ? "border-primary bg-primary/10 font-medium text-primary"
                          : "border-border/30 hover:border-border hover:bg-muted"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredLangs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No languages match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleProcess} size="lg">
            Start OCR
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Choose Different File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FileDropzone
      accept=".pdf,.jpg,.jpeg,.png"
      files={files}
      onFilesChange={handleFilesChange}
      label="Drop a scanned PDF or image for OCR"
    />
  );
}
