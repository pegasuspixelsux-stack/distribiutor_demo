import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/src/context/ClientContext";
import { CartProvider } from "@/src/context/CartContext";
import { BusinessProvider } from "@/src/context/BusinessContext";
import { getBusinessSettings } from "@/src/services/businessService";
import BottomNav from "@/src/components/BottomNav";
import { SHARE_DESCRIPTION, SHARE_IMAGE, SHARE_IMAGE_ALT, SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, SHARE_TITLE, SITE_DESCRIPTION, SITE_TITLE } from "@/src/lib/siteMeta";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Colors the browser toolbar / status bar (Safari, Chrome on phones).
export async function generateViewport(): Promise<Viewport> {
  const { backgroundColor } = await getBusinessSettings();
  // viewport-fit=cover lets the installed app use the whole screen; the pages add the safe-area padding themselves.
  return { themeColor: backgroundColor || "#2E7D32", viewportFit: "cover" };
}

const DEFAULT_TITLE = SITE_TITLE;
const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;

// Absolute base for the social-share image and canonical URLs (Vercel sets the production host).
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const { businessName } = await getBusinessSettings();
  const name = businessName || DEFAULT_TITLE;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description: DEFAULT_DESCRIPTION,
    applicationName: name,
    keywords: [
      "frutas y verduras",
      "distribuidor hortifrutícola",
      "mayorista",
      "Punta del Este",
      "Maldonado",
      "gastronomía",
      "restaurantes",
      "hoteles",
    ],
    authors: [{ name }],
    creator: name,
    publisher: name,
    category: "food",
    // Link preview (WhatsApp, Facebook, X): the /distribuidores promo text and its 1200 x 630 screenshot. Pages with their own
    // image (each product) override it.
    openGraph: {
      type: "website",
      siteName: name,
      title: SHARE_TITLE,
      description: SHARE_DESCRIPTION,
      locale: "es_UY",
      images: [{ url: SHARE_IMAGE, width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT, alt: SHARE_IMAGE_ALT, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: SHARE_TITLE,
      description: SHARE_DESCRIPTION,
      images: [SHARE_IMAGE],
    },
    appleWebApp: { capable: true, title: name, statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const business = await getBusinessSettings();
  return (
    <html
      lang="es-UY"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--brand-bg": business.backgroundColor || "#2E7D32" } as CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <BusinessProvider initial={business}>
          <ClientProvider>
            <CartProvider>
              {children}
              <BottomNav />
            </CartProvider>
          </ClientProvider>
        </BusinessProvider>
      </body>
    </html>
  );
}
