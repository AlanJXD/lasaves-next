"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function InicioPage() {
  const { user } = useAuth();
  const nombre = user?.nombre || "Usuario";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white px-5 py-10">
        <div className="mx-auto w-full max-w-5xl">
          {/* Encabezado */}
          <header className="mb-12 mt-10">
            <h1 className="text-3xl font-semibold text-[color:var(--text)]">
              Hola {nombre}
            </h1>
            <p className="mt-2 text-sm text-[#8a94a3]">Bienvenido de nuevo</p>
          </header>

        {/* Grid principal */}
        <section className="grid grid-cols-2 grid-rows-2 gap-6">
          {/* Ingresos (arriba izquierda) */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-44 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Ingresos
            </div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text)]">
              $58,420
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Mes en curso</div>
          </article>

          {/* Gastos (arriba derecha) — ligeramente más grande */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Gastos
            </div>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--text)]">
              $41,300
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Mes en curso</div>
          </article>

          {/* Movimientos (abajo izquierda) — ligeramente más grande */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Movimientos
            </div>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--text)]">
              128
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Últimos 7 días</div>
          </article>

          {/* Balance (abajo derecha) — con gradiente fijo */}
          <article
            className="rounded-2xl p-6 h-44 text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            style={{
              background:
                "linear-gradient(135deg, var(--brand) 0%, #2b4c6a 100%)",
            }}
          >
            <div className="text-xs uppercase tracking-wide opacity-90">
              Balance general
            </div>
            <div className="mt-3 text-2xl font-semibold">$17,120</div>
            <div className="mt-1 text-xs opacity-80">Disponible</div>
          </article>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
