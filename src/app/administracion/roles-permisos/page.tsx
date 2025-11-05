"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  PlusIcon,
  ChevronLeftIcon,
  NoSymbolIcon, // icono para "Desactivar"
} from "@heroicons/react/24/solid";

type Rol = {
  id: string;
  nombre: "Administrador" | "Socio" | "Enfermero";
  descripcion?: string;
  activo: boolean;
};

const demoRoles: Rol[] = [
  { id: "r1", nombre: "Administrador", descripcion: "Acceso total al sistema", activo: true },
  { id: "r2", nombre: "Socio",         descripcion: "Acceso a módulos financieros", activo: true },
  { id: "r3", nombre: "Enfermero",     descripcion: "Acceso a pacientes y reportes clínicos", activo: true },
];

/** Swipe-left con UNA acción: Desactivar. Tap en card = Editar. */
function SwipeableCard({
  children,
  onTap,
  onDeactivate,
  isOpen,
  setOpen,
}: {
  children: React.ReactNode;
  onTap: () => void;
  onDeactivate: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const ACTION_WIDTH = 96; // px
  const [tx, setTx] = useState(0);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const dragging = useRef(false);

  useEffect(() => {
    setTx(isOpen ? -ACTION_WIDTH : 0);
  }, [isOpen]);

  useEffect(() => {
    function onTouchStartOutside(e: TouchEvent) {
      if (!(e.target as HTMLElement)?.closest?.("[data-swipe-card]")) {
        setOpen(false);
      }
    }
    document.addEventListener("touchstart", onTouchStartOutside, { passive: true });
    return () => document.removeEventListener("touchstart", onTouchStartOutside);
  }, [setOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    moved.current = false;
    startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;

    if (Math.abs(dx) > 6) moved.current = true;

    const base = isOpen ? -ACTION_WIDTH : 0;
    const next = Math.max(-ACTION_WIDTH - 24, Math.min(0, base + dx));
    setTx(next);
  };

  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    if (!moved.current) {
      setOpen(false);
      setTx(0);
      onTap();
      return;
    }

    const shouldOpen = Math.abs(tx) > ACTION_WIDTH * 0.5;
    setOpen(shouldOpen);
    setTx(shouldOpen ? -ACTION_WIDTH : 0);
  };

  return (
    <div className="relative" data-swipe-card>
      {/* Acción detrás: Desactivar */}
      <div className="absolute inset-y-0 right-0 z-0 flex items-stretch pr-2 pl-4">
        <button
          type="button"
          className="my-2 grid w-20 place-items-center rounded-xl bg-red-500 text-white active:scale-95 transition-transform"
          onClick={() => {
            setOpen(false);
            setTx(0);
            onDeactivate();
          }}
        >
          <NoSymbolIcon className="h-5 w-5" />
          <span className="text-[11px] font-medium">Desactivar</span>
        </button>
      </div>

      {/* Card deslizante */}
      <div
        className="relative z-10 will-change-transform transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${tx}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default function RolesPermisosPage() {
  const router = useRouter();
  const roles = useMemo(() => demoRoles, []);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main
      className="relative px-5"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom:
          "calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-h, 64px) + 96px)",
      }}
    >
      {/* Top bar */}
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-3 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Regresar"
            className="grid size-9 place-items-center rounded-full bg-[color:var(--input)] text-[color:var(--text)] hover:opacity-90 active:scale-95 touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-[color:var(--text)]">Roles</h1>
        </div>

        <p className="mb-2 text-sm text-gray-600">Roles disponibles en el sistema.</p>

        {/* Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => {
            const card = (
              <article
                key={r.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 active:translate-y-[1px] active:scale-[.995] touch-manipulation"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-150 group-active:opacity-100"
                />
                <div className="relative flex items-start gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: "var(--brand)" }}
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-[color:var(--text)]">
                        {r.nombre}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          r.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        title={r.activo ? "Activo" : "Inactivo"}
                      >
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-600">
                      {r.descripcion ?? "—"}
                    </p>
                  </div>
                </div>
              </article>
            );

            return (
              <SwipeableCard
                key={r.id}
                isOpen={openId === r.id}
                setOpen={(open) => setOpenId(open ? r.id : openId === r.id ? null : openId)}
                onTap={() => alert(`Editar rol: ${r.nombre}`)} // tap = editar
                onDeactivate={() =>
                  confirm(`¿Desactivar el rol ${r.nombre}?`) && alert("Rol desactivado")
                }
              >
                {card}
              </SwipeableCard>
            );
          })}
        </section>
      </div>

      {/* FAB (+) */}
      <button
        aria-label="Agregar rol"
        className="fixed right-5 z-40 grid size-14 place-items-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:scale-105"
        style={{
          backgroundColor: "var(--brand)",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-h, 64px) + 32px)",
        }}
        onClick={() => alert("Nuevo rol")}
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </main>
  );
}
