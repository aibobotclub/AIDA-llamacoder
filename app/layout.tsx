import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import "./globals.css";

let title = "Llama Coder – AI Code Generator";
let description = "Generate your next app with Llama 3.1 405B";
let url = "https://llamacoder.io/";
let ogimage = "https://llamacoder.io/og-image.png";
let sitename = "llamacoder.io";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlausibleProvider domain="llamacoder.io">
      <html lang="en" className="h-full">
        <body className="h-full">{children}</body>
      </html>
    </PlausibleProvider>
  );
}
