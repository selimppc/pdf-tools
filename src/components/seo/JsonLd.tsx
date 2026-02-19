export function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PDFtools",
    url: "https://pdf-tools.vercel.app",
    description:
      "Free, private PDF tools that run entirely in your browser. Merge, split, compress, convert, and edit PDFs with zero uploads.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://pdf-tools.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PDFtools",
    url: "https://pdf-tools.vercel.app",
    logo: "https://pdf-tools.vercel.app/icon.png",
    sameAs: [
      "https://github.com/selimppc/pdf-tools",
      "https://buymeacoffee.com/selimppc",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
      />
    </>
  );
}

export function SoftwareJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
