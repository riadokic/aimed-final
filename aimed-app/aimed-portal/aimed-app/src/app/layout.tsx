import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ToastContainer } from "@/components/ui/toast";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aimed.ba"),
  title: {
    default: "AiMED - AI diktiranje nalaza",
    template: "%s | AiMED",
  },
  description:
    "Pretvorite glasovni diktat u strukturirani medicinski nalaz za manje od 60 sekundi. GDPR usklađeno, bez IT integracija.",
  openGraph: {
    type: "website",
    locale: "bs_BA",
    url: "https://aimed.ba",
    siteName: "AiMED",
    title: "AiMED - AI diktiranje nalaza",
    description:
      "Pretvorite glasovni diktat u strukturirani medicinski nalaz za manje od 60 sekundi.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AiMED" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AiMED - AI diktiranje nalaza",
    description:
      "Pretvorite glasovni diktat u strukturirani medicinski nalaz za manje od 60 sekundi.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body className={`${inter.variable} font-sans antialiased`}>
        <JsonLd />
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
