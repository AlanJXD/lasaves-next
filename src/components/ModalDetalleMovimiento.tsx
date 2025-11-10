"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DocumentTextIcon, UserCircleIcon, CalendarIcon, CreditCardIcon, DocumentIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { finanzasService, Gasto, Ingreso } from '@/lib/finanzas';

interface ModalDetalleMovimientoProps {
  isOpen: boolean;
  onClose: () => void;
  movimientoId: string | null;
  tipo: "Ingreso" | "Gasto" | null;
  onEditar?: (id: number, tipo: "Ingreso" | "Gasto", detalles: Gasto | Ingreso) => void;
  onEliminar?: (id: number, tipo: "Ingreso" | "Gasto") => void;
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function ModalDetalleMovimiento({
  isOpen,
  onClose,
  movimientoId,
  tipo,
  onEditar,
  onEliminar,
}: ModalDetalleMovimientoProps) {
  const [detalles, setDetalles] = useState<Gasto | Ingreso | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  // Cargar detalles cuando se abre el modal
  useEffect(() => {
    if (isOpen && movimientoId && tipo) {
      cargarDetalles();
    }
  }, [isOpen, movimientoId, tipo]);

  const cargarDetalles = async () => {
    if (!movimientoId || !tipo) return;

    setIsLoading(true);
    setError("");

    try {
      // Extraer el ID numérico del string (quitar prefijo i- o g-)
      const id = parseInt(movimientoId.split('-')[1]);

      if (tipo === "Gasto") {
        const gasto = await finanzasService.obtenerGastoPorId(id);
        setDetalles(gasto);
      } else {
        const ingreso = await finanzasService.obtenerIngresoPorId(id);
        setDetalles(ingreso);
      }
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      setError(err instanceof Error ? err.message : "Error al cargar detalles");
    } finally {
      setIsLoading(false);
    }
  };

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setDetalles(null);
      setImagenAmpliada(false);
      setConfirmarEliminar(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isGasto = (detalle: Gasto | Ingreso): detalle is Gasto => {
    return 'id_gasto' in detalle;
  };

  const getNombreUsuario = (detalle: Gasto | Ingreso) => {
    const { nombre, apellido_paterno, apellido_materno } = detalle.usuario_registro;
    return `${nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-screen flex-col rounded-t-3xl bg-white shadow-2xl"
            style={{
              maxHeight: '90vh',
            }}
          >
            {/* Header */}
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Detalle del Movimiento
                </h2>
                <button
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-full bg-[color:var(--input)] text-[color:var(--text)] transition-colors hover:bg-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent" />
                  <p className="mt-4 text-sm text-[color:var(--muted,#8a94a3)]">
                    Cargando detalles...
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              ) : detalles ? (
                <div className="space-y-4">
                  {/* Tipo y Folio */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[color:var(--muted,#8a94a3)]">Folio</p>
                        <p className="text-lg font-semibold text-[color:var(--text)]">
                          #{isGasto(detalles) ? detalles.id_gasto : (detalles as Ingreso).id_ingreso}
                        </p>
                      </div>
                      <div className={`rounded-full px-4 py-2 text-sm font-medium text-white ${
                        tipo === "Ingreso" ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {tipo}
                      </div>
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <p className="text-xs text-[color:var(--muted,#8a94a3)]">Monto</p>
                    <p className={`text-3xl font-bold ${
                      tipo === "Ingreso" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tipo === "Gasto" ? "-" : "+"}{mxn.format(parseFloat(detalles.monto))}
                    </p>
                  </div>

                  {/* Concepto */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <div className="flex items-start gap-3">
                      <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-[color:var(--brand)]" />
                      <div className="flex-1">
                        <p className="text-xs text-[color:var(--muted,#8a94a3)]">Concepto</p>
                        <p className="mt-1 text-sm text-[color:var(--text)]">
                          {isGasto(detalles)
                            ? detalles.concepto
                            : (detalles as Ingreso).concepto || (detalles as Ingreso).servicio?.nombre || 'Sin concepto'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 flex-shrink-0 text-[color:var(--brand)]" />
                      <div className="flex-1">
                        <p className="text-xs text-[color:var(--muted,#8a94a3)]">Fecha</p>
                        <p className="mt-1 text-sm text-[color:var(--text)]">
                          {formatearFecha(isGasto(detalles) ? detalles.fecha_gasto : (detalles as Ingreso).fecha_ingreso)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <div className="flex items-start gap-3">
                      <CreditCardIcon className="h-5 w-5 flex-shrink-0 text-[color:var(--brand)]" />
                      <div className="flex-1">
                        <p className="text-xs text-[color:var(--muted,#8a94a3)]">Método de Pago</p>
                        <p className="mt-1 text-sm text-[color:var(--text)]">
                          {detalles.metodo_pago.nombre}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usuario que registró */}
                  <div className="rounded-xl bg-[color:var(--input)] p-4">
                    <div className="flex items-start gap-3">
                      <UserCircleIcon className="h-5 w-5 flex-shrink-0 text-[color:var(--brand)]" />
                      <div className="flex-1">
                        <p className="text-xs text-[color:var(--muted,#8a94a3)]">Registrado por</p>
                        <p className="mt-1 text-sm text-[color:var(--text)]">
                          {getNombreUsuario(detalles)}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted,#8a94a3)]">
                          {formatearFecha(detalles.fecha_registro)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {detalles.notas && (
                    <div className="rounded-xl bg-[color:var(--input)] p-4">
                      <div className="flex items-start gap-3">
                        <DocumentIcon className="h-5 w-5 flex-shrink-0 text-[color:var(--brand)]" />
                        <div className="flex-1">
                          <p className="text-xs text-[color:var(--muted,#8a94a3)]">Notas</p>
                          <p className="mt-1 text-sm text-[color:var(--text)] whitespace-pre-wrap">
                            {detalles.notas}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comprobante */}
                  {detalles.comprobante_url && (
                    <div className="rounded-xl bg-[color:var(--input)] p-4">
                      <p className="mb-3 text-xs text-[color:var(--muted,#8a94a3)]">Comprobante</p>
                      <div className="relative">
                        <img
                          src={detalles.comprobante_url}
                          alt="Comprobante"
                          className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setImagenAmpliada(true)}
                        />
                        <p className="mt-2 text-center text-xs text-[color:var(--muted,#8a94a3)]">
                          Toca para ampliar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-5 py-4 space-y-3" style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
            }}>
              {!confirmarEliminar ? (
                <>
                  {/* Botones de acción */}
                  {detalles && onEditar && onEliminar && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const id = isGasto(detalles) ? detalles.id_gasto : (detalles as Ingreso).id_ingreso;
                          onEditar(id, tipo!, detalles);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-medium transition-all hover:opacity-90 active:scale-[0.98] text-white"
                        style={{ backgroundColor: 'var(--brand)' }}
                      >
                        <PencilIcon className="h-5 w-5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmarEliminar(true)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-medium transition-all hover:opacity-90 active:scale-[0.98] bg-red-500 text-white"
                      >
                        <TrashIcon className="h-5 w-5" />
                        Eliminar
                      </button>
                    </div>
                  )}

                  {/* Botón cerrar */}
                  <button
                    onClick={onClose}
                    className="w-full rounded-full px-5 py-3 text-center font-medium transition-all hover:opacity-90 active:scale-[0.98] bg-[color:var(--input)] text-[color:var(--text)]"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  {/* Confirmación de eliminación */}
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-sm font-medium text-red-800 text-center">
                      ¿Estás seguro de eliminar este movimiento?
                    </p>
                    <p className="text-xs text-red-600 text-center mt-1">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmarEliminar(false)}
                      className="flex-1 rounded-full px-5 py-3 text-center font-medium transition-all hover:opacity-90 active:scale-[0.98] bg-[color:var(--input)] text-[color:var(--text)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (detalles && onEliminar) {
                          const id = isGasto(detalles) ? detalles.id_gasto : (detalles as Ingreso).id_ingreso;
                          onEliminar(id, tipo!);
                          onClose();
                        }
                      }}
                      className="flex-1 rounded-full px-5 py-3 text-center font-medium transition-all hover:opacity-90 active:scale-[0.98] bg-red-500 text-white"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Modal de imagen ampliada */}
          <AnimatePresence>
            {imagenAmpliada && detalles?.comprobante_url && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setImagenAmpliada(false)}
                  className="fixed inset-0 z-[60] bg-black/90"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                  onClick={() => setImagenAmpliada(false)}
                >
                  <button
                    onClick={() => setImagenAmpliada(false)}
                    className="absolute top-4 right-4 z-[61] grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <img
                    src={detalles.comprobante_url}
                    alt="Comprobante ampliado"
                    className="max-h-full max-w-full rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
