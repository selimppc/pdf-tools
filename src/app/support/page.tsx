import { Coffee, Heart, Github, Globe, Star, Users, Code, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support PDFtools - Help Keep It Free & Private",
  description:
    "PDFtools is 100% free with no ads. Support the project to help us keep building privacy-first PDF tools for everyone.",
};

const supportOptions = [
  {
    name: "Buy Me a Coffee",
    description:
      "One-time or monthly support. Quick and easy — every coffee helps keep the servers running.",
    url: "https://buymeacoffee.com/selimppc",
    icon: Coffee,
    color: "text-amber-500",
    bg: "bg-amber-500/10 hover:bg-amber-500/15",
    borderColor: "border-amber-500/20",
    cta: "Buy a Coffee",
    featured: true,
  },
  {
    name: "Ko-fi",
    description:
      "Support with zero platform fees — 100% of your donation goes directly to development.",
    url: "https://ko-fi.com/selimppc",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10 hover:bg-rose-500/15",
    borderColor: "border-rose-500/20",
    cta: "Support on Ko-fi",
    featured: true,
  },
  {
    name: "GitHub Sponsors",
    description:
      "Sponsor through GitHub. Get a sponsor badge on your profile and support open-source development.",
    url: "https://github.com/sponsors/selimppc",
    icon: Github,
    color: "text-violet-500",
    bg: "bg-violet-500/10 hover:bg-violet-500/15",
    borderColor: "border-violet-500/20",
    cta: "Sponsor on GitHub",
    featured: false,
  },
  {
    name: "Star on GitHub",
    description:
      "Free and powerful! Starring the repo boosts visibility and helps other developers discover the project.",
    url: "https://github.com/selimppc/pdf-tools",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 hover:bg-yellow-500/15",
    borderColor: "border-yellow-500/20",
    cta: "Star the Repo",
    featured: false,
  },
];

const otherWays = [
  {
    icon: Globe,
    title: "Share the Word",
    description:
      "Tell your friends, colleagues, or followers about PDFtools. Share on Twitter, LinkedIn, Reddit, or your blog.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Report bugs, suggest features, or join discussions on GitHub Issues. Your feedback shapes the product.",
  },
  {
    icon: Code,
    title: "Contribute Code",
    description:
      "PDFtools is open source. Submit a PR to fix bugs, add features, or improve documentation.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Support PDFtools
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          PDFtools is <strong>100% free</strong>, <strong>open source</strong>,
          and <strong>ad-free</strong>. Your support helps cover hosting costs
          and funds new features and tools.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {supportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col gap-4 rounded-2xl border ${option.borderColor} ${option.bg} p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${option.color}`} />
                  <h3 className="font-semibold">{option.name}</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <div
                className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg border ${option.borderColor} px-4 py-2 text-sm font-medium ${option.color}`}
              >
                {option.cta}
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-16">
        <h2 className="text-center text-xl font-bold">
          Other Ways to Support
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Not everyone can donate — and that&apos;s totally fine. Here are free
          ways to help.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {otherWays.map((way) => {
            const Icon = way.icon;
            return (
              <div
                key={way.title}
                className="rounded-2xl border border-border/50 bg-card p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{way.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {way.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border/50 bg-card p-8 text-center">
        <h2 className="text-xl font-bold">Where Does the Money Go?</h2>
        <div className="mx-auto mt-6 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Hosting & Infrastructure</p>
            <p className="mt-1 text-xs text-muted-foreground">
              CDN, domain, SSL certificates, and static hosting costs
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">New Tools & Features</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Building more PDF tools, AI features, and offline support
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Open Source Maintenance</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bug fixes, security updates, dependency management
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Keeping It Free & Ad-Free</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your support means we never need to add ads or paywalls
            </p>
          </div>
        </div>
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
