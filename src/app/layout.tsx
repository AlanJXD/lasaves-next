import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabsWrapper from "@/components/TabsWrapper";
import StatusBar from "@/components/StatusBar";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Las Aves - Gestión de Estancia",
  description: "Sistema de gestión para estancia de adultos mayores",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Las Aves",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-sans bg-white text-[color:var(--text)]">
        <AuthProvider>
          {/* status bar superior con color dinámico */}
          <StatusBar />
          <TabsWrapper>{children}</TabsWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
