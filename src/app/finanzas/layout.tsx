import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1d344a",
};

export default function FinanzasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
