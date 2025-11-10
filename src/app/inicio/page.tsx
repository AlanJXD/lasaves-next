"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import InicioShimmer from "@/components/InicioShimmer";
import ModalReporteFinanciero from "@/components/ModalReporteFinanciero";
import { MODULES } from "@/lib/authorization";
import { useAuth } from "@/contexts/AuthContext";
import { estadisticasService, EstadisticasResumen } from "@/lib/estadisticas";
import { FileText } from "lucide-react";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function InicioPage() {
  const { user } = useAuth();
  const nombre = user?.nombre || "Usuario";

  const [estadisticas, setEstadisticas] = useState<EstadisticasResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalReporteOpen, setIsModalReporteOpen] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await estadisticasService.obtenerResumen();
        setEstadisticas(data);
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
      } finally {
        setIsLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  return (
    <ProtectedRoute>
      <RoleProtectedRoute module={MODULES.INICIO}>
      <main className="min-h-screen bg-white px-5 py-10">
        <div className="mx-auto w-full max-w-5xl">
          {/* Encabezado */}
          <header className="mb-8 mt-10">
            <h1 className="text-3xl font-semibold text-[color:var(--text)]">
              Hola {nombre}
            </h1>
            <p className="mt-2 text-sm text-[#8a94a3]">Bienvenido de nuevo</p>
          </header>

          {/* Botón de Reporte Financiero */}
          <div className="mb-6">
            <button
              onClick={() => setIsModalReporteOpen(true)}
              className="flex items-center gap-3 rounded-xl bg-[color:var(--brand)] px-6 py-3 text-white font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              <FileText className="h-5 w-5" />
              <span>Generar Reporte Financiero</span>
            </button>
          </div>

        {/* Grid principal */}
        {isLoading ? (
          <InicioShimmer />
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        ) : estadisticas ? (
        <section className="grid grid-cols-2 grid-rows-2 gap-6">
          {/* Ingresos (arriba izquierda) */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-44 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Ingresos
            </div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text)]">
              {mxn.format(estadisticas.ingresos.total)}
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Total general</div>
          </article>

          {/* Gastos (arriba derecha) — ligeramente más grande */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Gastos
            </div>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--text)]">
              {mxn.format(estadisticas.gastos.total)}
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Total general</div>
          </article>

          {/* Movimientos (abajo izquierda) — ligeramente más grande */}
          <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-wide text-[#8a94a3]">
              Movimientos
            </div>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--text)]">
              {estadisticas.movimientos_totales.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-[#8a94a3]">Total general</div>
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
            <div className="mt-3 text-2xl font-semibold">
              {mxn.format(estadisticas.balance)}
            </div>
            <div className="mt-1 text-xs opacity-80">Disponible</div>
          </article>
        </section>
        ) : null}

        {/* Modal de Reporte Financiero */}
        <ModalReporteFinanciero
          isOpen={isModalReporteOpen}
          onClose={() => setIsModalReporteOpen(false)}
        />
      </div>
    </main>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
