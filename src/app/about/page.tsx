import { Shield, Zap, Code, Globe, Lock, Heart } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Privacy by Design",
    description:
      "Every file you process stays on your device. We use client-side JavaScript and WebAssembly to handle all PDF operations directly in your browser. Nothing is ever uploaded to a server.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description:
      "No server queues, no waiting. Your files are processed instantly using your device's computing power. The result is available in seconds, not minutes.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Code,
    title: "Open Source",
    description:
      "Our code is open for inspection. You can verify exactly how your files are processed. Transparency builds trust.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Globe,
    title: "Works Offline",
    description:
      "Once loaded, many of our tools work without an internet connection. Perfect for handling sensitive documents anywhere.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Lock,
    title: "No Account Required",
    description:
      "No sign-ups, no email collection, no user tracking. Just open the tool and use it. Simple as that.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Heart,
    title: "Free Forever",
    description:
      "Every tool is completely free with no usage limits. No freemium tricks, no premium tiers, no ads.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About PDFtools
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We believe working with PDFs should be simple, fast, and private. Every
          tool runs entirely in your browser — your files never touch a server.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => {
          const Icon = principle.icon;
          return (
            <div
              key={principle.title}
              className="space-y-3 rounded-2xl border border-border/50 bg-card p-6"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${principle.bg}`}
              >
                <Icon className={`h-5 w-5 ${principle.color}`} />
              </div>
              <h3 className="font-semibold">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {principle.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-border/50 bg-card p-8 text-center">
        <h2 className="text-xl font-bold">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          When you select a file, it&apos;s read directly into your browser&apos;s
          memory using the File API. We then use libraries like pdf-lib and
          PDF.js to process the file entirely in JavaScript. The result is
          generated as a Blob and downloaded directly to your device. At no point
          does any data leave your browser.
        </p>
      </div>
    </div>
  );
}
