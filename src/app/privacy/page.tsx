import {
  Shield,
  Server,
  Eye,
  Cookie,
  Database,
  FileCode,
  Lock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PDFtools",
  description:
    "PDFtools processes all files in your browser. No uploads, no cookies, no tracking. Read our privacy commitment.",
};

const promises = [
  {
    icon: Server,
    title: "No Server Uploads",
    description:
      "Your files are never sent to any server. All PDF processing happens locally in your browser using JavaScript and WebAssembly. We physically cannot access your files.",
  },
  {
    icon: Eye,
    title: "No Tracking",
    description:
      "We don't use Google Analytics, Facebook Pixel, or any tracking scripts. We don't track which tools you use, how often, or what files you process.",
  },
  {
    icon: Cookie,
    title: "No Cookies",
    description:
      "We don't set any cookies. The only local storage used is your theme preference (dark/light mode), which stays on your device.",
  },
  {
    icon: Database,
    title: "No Data Collection",
    description:
      "We don't collect email addresses, names, IP addresses, or any personal information. There are no accounts, no sign-ups, no forms.",
  },
  {
    icon: FileCode,
    title: "Open Source",
    description:
      "Our entire codebase is open source on GitHub. You can inspect every line of code to verify our privacy claims. Transparency is our policy.",
  },
  {
    icon: Lock,
    title: "No Third-Party Access",
    description:
      "Since we never receive your files, no third party can access them either. There is no data to breach, sell, or share.",
  },
];

const technicalDetails = [
  {
    question: "How does file processing work?",
    answer:
      "When you select a file, the browser reads it into memory using the File API. We then use JavaScript libraries (pdf-lib, PDF.js) to process the file directly in your browser's memory. The result is generated as a Blob and downloaded to your device. At no point does any data leave your browser.",
  },
  {
    question: "What about the PDF.js worker file loaded from a CDN?",
    answer:
      "The PDF.js worker is a JavaScript file that helps render PDF pages. It's loaded from Cloudflare's CDN (cdnjs). This is a static script file — no data is sent to the CDN. Your PDF files are never transmitted.",
  },
  {
    question: "Do you use any analytics?",
    answer:
      "No. We have zero analytics, zero telemetry, and zero tracking. We don't know how many users we have, and that's by design.",
  },
  {
    question: "What about hosting?",
    answer:
      "The site is hosted as static files on Vercel. The hosting provider serves HTML, CSS, and JavaScript files to your browser. All PDF processing happens after these files are loaded — entirely on your device.",
  },
  {
    question: "Can you see my files if I report a bug?",
    answer:
      "No. Bug reports go through GitHub Issues. We never ask for or accept user files. If you encounter a bug, describe the steps to reproduce it and we'll investigate using test files.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Shield className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          PDFtools was built with a simple principle:{" "}
          <strong>your files are yours</strong>. We can&apos;t see them, we
          don&apos;t want them, and we built our architecture to make it
          impossible for us to access them.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          Zero-Knowledge Architecture
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          We process zero files on our servers. We collect zero personal data. We
          use zero cookies. We run zero analytics.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {promises.map((promise) => {
          const Icon = promise.icon;
          return (
            <div
              key={promise.title}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Icon className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold">{promise.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {promise.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-16">
        <h2 className="text-center text-xl font-bold">Technical Details</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          For the technically curious — here&apos;s exactly how it works under
          the hood.
        </p>
        <div className="mt-8 space-y-4">
          {technicalDetails.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-border/50 bg-card p-5"
            >
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground">
        <p>
          This privacy policy is effective as of February 2026. Since we
          don&apos;t collect data, there&apos;s nothing to update — but if our
          architecture changes, this page will be updated and the change will be
          visible in our{" "}
          <a
            href="https://github.com/selimppc/pdf-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            open-source repository
          </a>
          .
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to tools
        </Link>
      </div>
    </div>
  );
}
