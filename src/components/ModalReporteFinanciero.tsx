// src/components/ModalReporteFinanciero.tsx
"use client";

import { useState } from "react";
import { X, FileText, Calendar } from "lucide-react";
import { reportesService } from "@/lib/reportes";

interface ModalReporteFinancieroProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalReporteFinanciero({
  isOpen,
  onClose,
}: ModalReporteFinancieroProps) {
  const [tipoFecha, setTipoFecha] = useState<"mes_actual" | "personalizado">("mes_actual");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerar = async () => {
    setError("");
    setIsGenerating(true);
    setPdfUrl(null);

    try {
      let inicio: string;
      let fin: string;

      if (tipoFecha === "mes_actual") {
        const ahora = new Date();
        const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

        inicio = primerDia.toISOString();
        fin = ultimoDia.toISOString();
      } else {
        if (!fechaInicio || !fechaFin) {
          setError("Debes seleccionar ambas fechas");
          setIsGenerating(false);
          return;
        }

        const inicioDate = new Date(fechaInicio + "T00:00:00.000Z");
        const finDate = new Date(fechaFin + "T23:59:59.999Z");

        if (inicioDate >= finDate) {
          setError("La fecha de inicio debe ser anterior a la fecha de fin");
          setIsGenerating(false);
          return;
        }

        inicio = inicioDate.toISOString();
        fin = finDate.toISOString();
      }

      const blob = await reportesService.generarReporteFinanciero({
        fecha_inicio: inicio,
        fecha_fin: fin,
      });

      // Crear URL para visualizar el PDF
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setError(err instanceof Error ? err.message : "Error al generar el reporte");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescargar = () => {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `reporte-financiero-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal que sube desde abajo */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl animate-slide-up"
        style={{
          maxHeight: "90vh",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[color:var(--brand)]/10 p-2">
              <FileText className="h-5 w-5 text-[color:var(--brand)]" />
            </div>
            <h2 className="text-xl font-semibold text-[color:var(--text)]">
              Reporte Financiero
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {!pdfUrl ? (
            <div className="space-y-6">
              {/* Selector de tipo de fecha */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--text)] mb-3">
                  Periodo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTipoFecha("mes_actual")}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      tipoFecha === "mes_actual"
                        ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Mes Actual</span>
                  </button>
                  <button
                    onClick={() => setTipoFecha("personalizado")}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      tipoFecha === "personalizado"
                        ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Personalizado</span>
                  </button>
                </div>
              </div>

              {/* Selector de fechas personalizado */}
              {tipoFecha === "personalizado" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[color:var(--brand)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
                      Fecha de fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[color:var(--brand)] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Botón generar */}
              <button
                onClick={handleGenerar}
                disabled={isGenerating}
                className="w-full rounded-xl bg-[color:var(--brand)] px-6 py-4 font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? "Generando..." : "Generar Reporte"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Visualizador PDF */}
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                <iframe
                  src={pdfUrl}
                  className="w-full"
                  style={{ height: "60vh" }}
                  title="Reporte Financiero"
                />
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPdfUrl(null);
                    setError("");
                  }}
                  className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-[color:var(--text)] hover:bg-gray-50 transition-colors"
                >
                  Generar Nuevo
                </button>
                <button
                  onClick={handleDescargar}
                  className="rounded-xl bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-90 transition-all"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
