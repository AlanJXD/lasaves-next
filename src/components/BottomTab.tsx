"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, ShieldCheck } from "lucide-react";
import {
  HomeIcon as HomeSolid,
  BanknotesIcon as WalletSolid,
  ShieldCheckIcon as ShieldSolid,
} from "@heroicons/react/24/solid";

const items = [
  {
    href: "/",
    label: "Inicio",
    outline: Home,
    filled: HomeSolid,
  },
  {
    href: "/finanzas",
    label: "Finanzas",
    outline: Wallet,
    filled: WalletSolid,
  },
  {
    href: "/administracion",
    label: "Administración",
    outline: ShieldCheck,
    filled: ShieldSolid,
  },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <>
      {/* Espaciador inferior */}
      <div className="h-24" />

      {/* Safe-area inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-[env(safe-area-inset-bottom,0px)] bg-white" />

      {/* Isla flotante estática tipo iOS */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-50 flex justify-center">
        <nav
          className="pointer-events-auto flex items-center justify-center gap-12 rounded-full px-8 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md"
          style={{
            backgroundColor: "#cfd3da",
            maxWidth: 440,
            width: "calc(100% - 44px)",
          }}
          aria-label="Navegación principal"
        >
          {items.map(({ href, label, outline: OutlineIcon, filled: FilledIcon }) => {
            const active = pathname === href;
            const Icon = active ? FilledIcon : OutlineIcon;

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`grid size-12 place-items-center rounded-full transition-colors duration-200 ease-out ${
                  active
                    ? "bg-[color:var(--brand)] text-white shadow-[0_0_10px_rgba(29,52,74,0.35)]"
                    : "text-[color:var(--text)]/80 hover:text-[color:var(--text)] active:text-[color:var(--text)]"
                }`}
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
