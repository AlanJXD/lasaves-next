import type { Metadata } from "next";
import "./globals.css";
import TabsWrapper from "@/components/TabsWrapper";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Mi App",
  description: "PWA con navegación móvil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans bg-white text-[color:var(--text)]">
        <AuthProvider>
          {/* status bar superior blanca */}
          <div className="fixed top-0 left-0 right-0 z-50 h-[env(safe-area-inset-top,0px)] bg-white" />
          <TabsWrapper>{children}</TabsWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
