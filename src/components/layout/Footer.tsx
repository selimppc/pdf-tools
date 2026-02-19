import { Shield, Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                P
              </div>
              <span className="text-lg font-bold tracking-tight">
                PDF<span className="text-primary">tools</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free, private, and fast PDF tools that run entirely in your
              browser. No uploads, no servers, no tracking.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Popular Tools</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/tools/merge-pdf"
                className="transition-colors hover:text-foreground"
              >
                Merge PDF
              </Link>
              <Link
                href="/tools/split-pdf"
                className="transition-colors hover:text-foreground"
              >
                Split PDF
              </Link>
              <Link
                href="/tools/compress-pdf"
                className="transition-colors hover:text-foreground"
              >
                Compress PDF
              </Link>
              <Link
                href="/tools/pdf-to-jpg"
                className="transition-colors hover:text-foreground"
              >
                PDF to JPG
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">More Tools</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/tools/rotate-pdf"
                className="transition-colors hover:text-foreground"
              >
                Rotate PDF
              </Link>
              <Link
                href="/tools/jpg-to-pdf"
                className="transition-colors hover:text-foreground"
              >
                JPG to PDF
              </Link>
              <Link
                href="/tools/add-watermark"
                className="transition-colors hover:text-foreground"
              >
                Add Watermark
              </Link>
              <Link
                href="/tools/protect-pdf"
                className="transition-colors hover:text-foreground"
              >
                Protect PDF
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Privacy</h4>
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                All processing happens in your browser. Your files are never
                uploaded to any server. We don&apos;t collect any data.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PDFtools. Free and open source.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart className="h-3 w-3 text-rose-500" /> for
              privacy
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
