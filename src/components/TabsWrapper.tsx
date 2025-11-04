"use client";

import { usePathname } from "next/navigation";
import BottomTab from "./BottomTab";
import TransitionLayout from "@/app/transition-layout";

export default function TabsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTabs = pathname?.startsWith("/login");

  return (
    <div className="relative min-h-dvh pb-24 overflow-hidden">
      <TransitionLayout>{children}</TransitionLayout>
      {!hideTabs && <BottomTab />}
    </div>
  );
}
