import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://pdf-tools.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "PDFtools - Free, Private PDF Tools in Your Browser",
    template: "%s | PDFtools",
  },
  description:
    "Merge, split, compress, convert, and edit PDFs entirely in your browser. 100% private — your files never leave your device. No sign-up, no ads, completely free.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "convert PDF",
    "PDF to JPG",
    "JPG to PDF",
    "rotate PDF",
    "free PDF tools",
    "private PDF tools",
    "online PDF editor",
    "browser-based PDF",
    "no upload PDF",
    "client-side PDF",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "PDFtools - Free, Private PDF Tools in Your Browser",
    description:
      "Merge, split, compress, convert, and edit PDFs entirely in your browser. 100% private — your files never leave your device.",
    url: SITE_URL,
    siteName: "PDFtools",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFtools - Free, Private PDF Tools",
    description:
      "100% private PDF tools that run in your browser. No uploads, no tracking, completely free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HomeJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
