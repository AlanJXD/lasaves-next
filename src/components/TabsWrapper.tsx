"use client";

import { usePathname } from "next/navigation";
import BottomTab from "./BottomTab";
import TransitionLayout from "@/app/transition-layout";

const TABBAR_H = 64;

export default function TabsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTabs = pathname?.startsWith("/login");

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{ ["--tabbar-h" as any]: `${TABBAR_H}px` }}
    >
      <div className={hideTabs ? "" : "pb-[calc(env(safe-area-inset-bottom,0px)+var(--tabbar-h))]"}>
        <TransitionLayout>{children}</TransitionLayout>
      </div>

      {!hideTabs && (
        <div
          className="fixed inset-x-0 bottom-0 z-30"
          style={{
            height: `calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-h))`,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <BottomTab />
        </div>
      )}
    </div>
  );
}
