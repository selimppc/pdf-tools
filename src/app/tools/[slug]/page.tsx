import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, tools } from "@/config/tools";
import { ToolClient } from "./ToolClient";

const SITE_URL = "https://pdf-tools.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return { title: "Tool Not Found" };
  }

  const title = `${tool.name} - Free Online ${tool.name} Tool | PDFtools`;
  const description = `${tool.description}. 100% free, private, and secure — your files never leave your browser. No sign-up required.`;

  return {
    title,
    description,
    keywords: [
      tool.name,
      `${tool.name} online`,
      `${tool.name} free`,
      `free ${tool.name.toLowerCase()}`,
      "PDF tools",
      "private PDF",
      "browser-based",
      "no upload",
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tools/${slug}`,
      siteName: "PDFtools",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/tools/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  return tools
    .filter((t) => t.implemented)
    .map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || !tool.implemented) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: tool.name,
            description: tool.description,
            url: `${SITE_URL}/tools/${slug}`,
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side processing",
              "No file uploads to servers",
              "No registration required",
              "Free with no limits",
            ],
          }),
        }}
      />
      <ToolClient slug={slug} />
    </>
  );
}
