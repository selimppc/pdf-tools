# PDFtools — Free, Private PDF Tools in Your Browser

> Merge, split, compress, convert, and edit PDFs entirely in your browser. 100% client-side — your files never leave your device.

**Live:** [pdf-tools.vercel.app](https://pdf-tools.vercel.app)

---

## Why PDFtools?

| | PDFtools | Most PDF sites |
|---|---|---|
| **Privacy** | 100% client-side, zero uploads | Files uploaded to servers |
| **Speed** | Instant, no network latency | Server queues, wait times |
| **Cost** | Completely free, no limits | Freemium with restrictions |
| **Ads** | None | Ad-supported free tiers |
| **Tracking** | Zero analytics, zero cookies | Google Analytics, Facebook Pixel |
| **Sign-up** | Not required | Email required |

## Available Tools

### Organize
- **Merge PDF** — Combine multiple PDFs into one, drag to reorder
- **Split PDF** — Extract pages or split by range
- **Rotate PDF** — Rotate pages 90°, 180°, or 270°

### Optimize
- **Compress PDF** — Reduce file size with configurable quality

### Convert
- **PDF to JPG** — Each page as a high-quality image (ZIP download)
- **JPG to PDF** — Batch convert images with page size options

### Coming Soon
Remove Pages, Organize Pages, PDF to PNG, PDF to Word, PDF to Text, PNG to PDF, Word to PDF, HTML to PDF, Add Watermark, Page Numbers, Sign PDF, Annotate PDF, Protect PDF, Unlock PDF, OCR, AI Summarize

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **PDF Engine:** [pdf-lib](https://pdf-lib.js.org) — merge, split, rotate, compress, image-to-PDF
- **PDF Rendering:** [pdfjs-dist](https://mozilla.github.io/pdf.js/) — page previews, PDF-to-image
- **Image Bundling:** [JSZip](https://stuk.github.io/jszip/) — multi-page image downloads
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes) — dark mode by default

## Architecture

```
Browser (everything runs here)
├── React UI (Next.js App Router)
├── pdf-lib        → merge, split, rotate, compress, images-to-PDF
├── pdfjs-dist     → render pages, PDF-to-images
├── JSZip          → bundle multi-page exports
└── Canvas API     → image rendering
```

**Zero server involvement.** Files are processed as `ArrayBuffer` / `Uint8Array` in the browser. No uploads, no tracking, no cookies.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with tool grid
│   ├── tools/[slug]/page.tsx       # Dynamic tool pages (SSG)
│   ├── about/page.tsx
│   ├── privacy/page.tsx
│   ├── support/page.tsx
│   ├── sitemap.ts                  # Auto-generated sitemap
│   └── robots.ts                   # Search engine directives
├── components/
│   ├── layout/                     # Header, Footer
│   ├── tools/                      # FileDropzone, ToolCard, MergeTool, etc.
│   ├── seo/                        # JSON-LD structured data
│   └── ui/                         # shadcn/ui components
├── config/
│   └── tools.ts                    # Tool registry (22 tools)
└── lib/
    └── pdf/                        # Processing functions per tool
        ├── merge.ts
        ├── split.ts
        ├── compress.ts
        ├── rotate.ts
        ├── toImages.ts
        └── fromImages.ts
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/selimppc/pdf-tools.git
cd pdf-tools

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security

PDFtools ships with strict security headers:

- **Strict-Transport-Security** — forces HTTPS with HSTS preload
- **X-Frame-Options: SAMEORIGIN** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **Referrer-Policy** — limits referrer data leakage
- **Permissions-Policy** — blocks camera, microphone, geolocation, and FLoC

## SEO

- Dynamic meta tags per tool page (title, description, keywords)
- Open Graph and Twitter Card metadata
- JSON-LD structured data (WebSite, Organization, SoftwareApplication)
- Auto-generated `sitemap.xml` and `robots.txt`
- Static generation (SSG) for all tool pages

## Deploy

One-click deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fselimppc%2Fpdf-tools)

Or deploy anywhere that supports Next.js (Netlify, Cloudflare Pages, self-hosted).

## Support

PDFtools is free and open source. If you find it useful:

- [Buy Me a Coffee](https://buymeacoffee.com/selimppc)
- [Ko-fi](https://ko-fi.com/selimppc)
- [Star this repo](https://github.com/selimppc/pdf-tools) — it helps others discover the project

## License

MIT — use it however you want.
