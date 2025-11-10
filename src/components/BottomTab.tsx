"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, ShieldCheck, UserRound } from "lucide-react";
import {
  HomeIcon as HomeSolid,
  BanknotesIcon as WalletSolid,
  ShieldCheckIcon as ShieldSolid,
  UserCircleIcon as UserFilled,
} from "@heroicons/react/24/solid";
import { useAuthorization } from "@/hooks/useAuthorization";
import { MODULES, Module } from "@/lib/authorization";

const items = [
  { href: "/",               label: "Inicio",          outline: Home,        filled: HomeSolid, module: MODULES.INICIO },
  { href: "/finanzas",       label: "Finanzas",        outline: Wallet,      filled: WalletSolid, module: MODULES.FINANZAS },
  { href: "/administracion", label: "Administración",  outline: ShieldCheck, filled: ShieldSolid, module: MODULES.ADMINISTRACION },
  { href: "/perfil",         label: "Perfil",          outline: UserRound,   filled: UserFilled, module: MODULES.PERFIL },
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomTab() {
  const pathname = usePathname();
  const { canAccessModule } = useAuthorization();

  // Filtrar items según los permisos del usuario
  const allowedItems = items.filter(item => canAccessModule(item.module));

  return (
    <>
      {/* Espaciador inferior */}
      <div className="h-24" />

      {/* Safe-area inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-[env(safe-area-inset-bottom,0px)] bg-white" />

      {/* Isla flotante tipo iOS */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-50 flex justify-center">
        <nav
          className="pointer-events-auto flex items-center justify-center gap-10 rounded-full px-8 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md"
          style={{
            backgroundColor: "#ffffff",
            maxWidth: 520,
            width: "calc(100% - 44px)",
          }}
          aria-label="Navegación principal"
        >
          {allowedItems.map(({ href, label, outline: OutlineIcon, filled: FilledIcon }) => {
            const active = isActivePath(pathname, href);
            const Icon = active ? FilledIcon : OutlineIcon;

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`grid size-12 place-items-center rounded-full transition-transform duration-150 ease-out active:scale-110 ${
                  active
                    ? "bg-[color:var(--brand)] text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                    : "text-[color:var(--text)]/80 hover:text-[color:var(--text)] active:text-[color:var(--text)] bg-transparent"
                }`}
                style={{
                  flexShrink: 0,
                  aspectRatio: "1/1",
                  WebkitTapHighlightColor: "transparent",
                }}
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
