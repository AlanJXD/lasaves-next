"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  PlusIcon,
  ChevronLeftIcon,
  PowerIcon, // usaremos este para "Desactivar"
} from "@heroicons/react/24/solid";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

const demoUsuarios: Usuario[] = [
  { id: "u1", nombre: "María López",  email: "maria@example.com", rol: "Admin",  activo: true  },
  { id: "u2", nombre: "Juan Pérez",   email: "juan@example.com",  rol: "Editor", activo: true  },
  { id: "u3", nombre: "Ana Castillo", email: "ana@example.com",   rol: "Viewer", activo: false },
  { id: "u4", nombre: "Luis Gómez",   email: "luis@example.com",  rol: "Editor", activo: true  },
  { id: "u5", nombre: "Sofía Herrera",email: "sofia@example.com", rol: "Viewer", activo: true  },
];

/** Swipe-left con UNA acción: Desactivar. Soporta tap para editar sin dispararse al hacer swipe. */
function SwipeableCard({
  children,
  onTap,         // Editar al tocar la card
  onDeactivate,  // Acción al deslizar y tocar el botón
  isOpen,
  setOpen,
}: {
  children: React.ReactNode;
  onTap: () => void;
  onDeactivate: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  // ancho total a revelar (botón + colchón)
  const ACTION_WIDTH = 96; // px
  const [tx, setTx] = useState(0);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const dragging = useRef(false);

  useEffect(() => {
    setTx(isOpen ? -ACTION_WIDTH : 0);
  }, [isOpen]);

  useEffect(() => {
    // cerrar si se toca fuera
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

    if (Math.abs(dx) > 6) moved.current = true; // umbral para considerar swipe

    // Solo izquierda (negativo), limitamos rango
    const base = isOpen ? -ACTION_WIDTH : 0;
    const next = Math.max(-ACTION_WIDTH - 24, Math.min(0, base + dx));
    setTx(next);
  };

  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    if (!moved.current) {
      // Tap auténtico → editar
      setOpen(false);
      setTx(0);
      onTap();
      return;
    }

    // Si fue desplazamiento → decide abrir/cerrar
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
          <PowerIcon className="h-5 w-5" />
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

export default function UsuariosPage() {
  const router = useRouter();
  const usuarios = useMemo(() => demoUsuarios, []);
  const [openId, setOpenId] = useState<string | null>(null); // card abierta

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
          <h1 className="text-xl font-semibold text-[color:var(--text)]">Usuarios</h1>
        </div>

        <p className="mb-2 text-sm text-gray-600">Listado de cuentas registradas.</p>

        {/* Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => {
            const card = (
              <article
                key={u.id}
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
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-[color:var(--text)]">
                        {u.nombre}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          u.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        title={u.activo ? "Activo" : "Inactivo"}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 opacity-70" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="mt-2">
                      <span className="rounded-full bg-[color:var(--input)] px-2.5 py-1 text-xs font-medium text-[color:var(--text)]/80">
                        {u.rol}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );

            return (
              <SwipeableCard
                key={u.id}
                isOpen={openId === u.id}
                setOpen={(open) => setOpenId(open ? u.id : openId === u.id ? null : openId)}
                onTap={() => alert(`Editar ${u.nombre}`)} // Tocar card → Editar
                onDeactivate={() =>
                  confirm(`¿Desactivar a ${u.nombre}?`) && alert("Usuario desactivado")
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
        aria-label="Agregar"
        className="fixed right-5 z-40 grid size-14 place-items-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:scale-105"
        style={{
          backgroundColor: "var(--brand)",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-h, 64px) + 32px)",
        }}
        onClick={() => alert("Nuevo usuario")}
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </main>
  );
}
