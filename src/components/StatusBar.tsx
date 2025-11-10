"use client";

import { usePathname } from "next/navigation";

export default function StatusBar() {
  const pathname = usePathname();

  // En finanzas usamos #1d344a, en el resto #ffffff
  const isFinanzas = pathname?.startsWith("/finanzas");
  const bgColor = isFinanzas ? "#1d344a" : "#ffffff";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[env(safe-area-inset-top,0px)]"
      style={{ backgroundColor: bgColor }}
    />
  );
}
