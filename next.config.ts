import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy: the page may only load code from itself, and talk to Firebase and ImageKit.
// 'unsafe-inline' is needed for the inline bootstrap scripts and styles Next.js itself emits;
// 'unsafe-eval' is only added for the dev server (hot reload).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://upload.imagekit.io https://ik.imagekit.io",
  "frame-src https://*.firebaseapp.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Never let another site put this one in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites only learn the origin, never the full URL (customer links carry a token in the query string).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Lets phones and other devices on your Wi-Fi load the dev server (http://<your-ip>:3000).
  // Without this, Next.js blocks its dev scripts for any host except localhost, the page
  // never hydrates, and buttons and links added by JavaScript don't work. Dev only.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  // Don't advertise the framework in a response header.
  poweredByHeader: false,
  // The old URLs (bookmarks, links already sent to customers) keep working.
  async redirects() {
    return [
      { source: "/items", destination: "/productos", permanent: true },
      { source: "/items/:id", destination: "/productos/:id", permanent: true },
      { source: "/dashboard/properties", destination: "/dashboard/productos", permanent: true },
      { source: "/dashboard/properties/:path*", destination: "/dashboard/productos/:path*", permanent: true },
      { source: "/dashboard/leads", destination: "/dashboard/pedidos", permanent: true },
      // The old Open Graph flyer was replaced by the /distribuidores promo page.
      { source: "/opengraph", destination: "/distribuidores", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
