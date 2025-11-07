"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { MODULES } from "@/lib/authorization";
import ModalMovimiento from "@/components/ModalMovimiento";
import ModalDetalleMovimiento from "@/components/ModalDetalleMovimiento";
import Toast from "@/components/Toast";
import BitacoraShimmer from "@/components/BitacoraShimmer";
import { finanzasService, Gasto, Ingreso, MetodoPago } from "@/lib/finanzas";

type Filtro = "Todos" | "Ingresos" | "Gastos";

type Movimiento = {
  id: string;
  tipo: "Ingreso" | "Gasto";
  concepto: string;
  monto: number;
  fecha: string;
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const ITEMS_POR_PAGINA = 20;

export default function BitacoraPage() {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<{
    id: string;
    tipo: "Ingreso" | "Gasto";
    datos?: any;
  } | null>(null);

  // Estado de datos
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Ref para el audio de notificación
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Cargar métodos de pago al montar
  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        const metodos = await finanzasService.obtenerMetodosPago();
        setMetodosPago(metodos);
      } catch (err) {
        console.error("Error al cargar métodos de pago:", err);
      }
    };
    cargarMetodosPago();
  }, []);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      // Cargar ingresos y gastos en paralelo (sin límite para traer todos)
      const [listaIngresos, listaGastos] = await Promise.all([
        finanzasService.listarIngresos({}),
        finanzasService.listarGastos({}),
      ]);

      // Combinar y ordenar movimientos
      const movimientosCombinados: Movimiento[] = [
        ...listaIngresos.ingresos.map((ing: Ingreso) => ({
          id: `i-${ing.id_ingreso}`,
          tipo: "Ingreso" as const,
          concepto: ing.concepto || ing.servicio?.nombre || "Sin concepto",
          monto: parseFloat(ing.monto),
          fecha: ing.fecha_ingreso,
        })),
        ...listaGastos.gastos.map((gst: Gasto) => ({
          id: `g-${gst.id_gasto}`,
          tipo: "Gasto" as const,
          concepto: gst.concepto,
          monto: parseFloat(gst.monto),
          fecha: gst.fecha_gasto,
        })),
      ].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      setMovimientos(movimientosCombinados);

      // Calcular total de páginas según filtro
      const movimientosFiltrados = filtro === "Todos"
        ? movimientosCombinados
        : movimientosCombinados.filter(m =>
            filtro === "Ingresos" ? m.tipo === "Ingreso" : m.tipo === "Gasto"
          );

      setTotalPaginas(Math.ceil(movimientosFiltrados.length / ITEMS_POR_PAGINA));
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

  const handleAbrirDetalle = (id: string, tipo: "Ingreso" | "Gasto") => {
    setMovimientoSeleccionado({ id, tipo });
    setModalDetalleAbierto(true);
  };

  const handleEditarMovimiento = (id: number, tipo: "Ingreso" | "Gasto", detalles: any) => {
    setModalDetalleAbierto(false);

    const datosEdicion = {
      tipo: tipo === "Ingreso" ? 'ingreso' as const : 'gasto' as const,
      id: id,
      monto: detalles.monto,
      concepto: tipo === "Gasto" ? detalles.concepto : (detalles.concepto || detalles.servicio?.nombre || ''),
      metodo_pago_id: detalles.metodo_pago.id_metodo,
      servicio_id: tipo === "Ingreso" ? detalles.servicio_id : undefined,
      notas: detalles.notas || undefined,
      comprobante_url: detalles.comprobante_url || undefined,
    };

    setMovimientoSeleccionado({ id: `${tipo === "Ingreso" ? 'i' : 'g'}-${id}`, tipo, datos: datosEdicion });
    setModalAbierto(true);
  };

  const handleEliminarMovimiento = async (id: number, tipo: "Ingreso" | "Gasto") => {
    try {
      const movimientoId = `${tipo === "Ingreso" ? 'i' : 'g'}-${id}`;

      // Optimistic update
      setMovimientos(prev => prev.filter(m => m.id !== movimientoId));

      // Llamar a la API
      if (tipo === "Ingreso") {
        await finanzasService.eliminarIngreso(id);
      } else {
        await finanzasService.eliminarGasto(id);
      }

      setToastMensaje("Movimiento eliminado exitosamente");
      setToastVisible(true);
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Error al reproducir sonido:", err);
        });
      }
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      cargarDatos();
    }
  };

  const handleGuardarMovimiento = async (
    formData: FormData,
    tipo: "ingreso" | "gasto"
  ) => {
    const comprobanteFile = formData.get("comprobante");
    const esEdicion = movimientoSeleccionado?.datos !== undefined;

    const data = {
      concepto: formData.get("concepto") as string,
      monto: parseFloat(formData.get("monto") as string),
      metodo_pago_id: parseInt(formData.get("metodo_pago_id") as string),
      servicio_id: formData.get("servicio_id") ? parseInt(formData.get("servicio_id") as string) : undefined,
      notas: formData.get("notas") as string | undefined,
      comprobante: comprobanteFile instanceof File ? comprobanteFile : undefined,
    };

    if (esEdicion) {
      const movimientoId = movimientoSeleccionado!.datos.id;

      try {
        if (tipo === "ingreso") {
          await finanzasService.actualizarIngreso(movimientoId, data);
        } else {
          await finanzasService.actualizarGasto(movimientoId, data);
        }

        setToastMensaje("Movimiento actualizado exitosamente");
        setToastVisible(true);
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error al reproducir sonido:", err);
          });
        }

        setMovimientoSeleccionado(null);
        cargarDatos();
      } catch (err) {
        console.error("Error al actualizar movimiento:", err);
        throw err;
      }
    } else {
      try {
        if (tipo === "ingreso") {
          await finanzasService.crearIngreso({
            ...data,
            fecha_ingreso: new Date().toISOString(),
          });
        } else {
          await finanzasService.crearGasto({
            ...data,
            fecha_gasto: new Date().toISOString(),
          });
        }

        setToastMensaje("Movimiento agregado exitosamente");
        setToastVisible(true);
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error al reproducir sonido:", err);
          });
        }

        cargarDatos();
      } catch (err) {
        console.error("Error al guardar movimiento:", err);
        throw err;
      }
    }
  };

  // Filtrar movimientos
  const movimientosFiltrados = filtro === "Todos"
    ? movimientos
    : movimientos.filter(m =>
        filtro === "Ingresos" ? m.tipo === "Ingreso" : m.tipo === "Gasto"
      );

  // Calcular movimientos de la página actual
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const movimientosPagina = movimientosFiltrados.slice(indiceInicio, indiceFin);

  // Recalcular total de páginas cuando cambian los movimientos filtrados
  useEffect(() => {
    setTotalPaginas(Math.ceil(movimientosFiltrados.length / ITEMS_POR_PAGINA));
  }, [movimientosFiltrados.length]);

  return (
    <ProtectedRoute>
      <RoleProtectedRoute module={MODULES.FINANZAS}>
        <main
          className="relative px-5 pb-24"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
            paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))",
          }}
        >
          <div className="mx-auto w-full max-w-md">
            {/* Header con botón de volver */}
            <div className="mb-6 flex items-center gap-3">
              <Link
                href="/finanzas"
                className="grid size-10 place-items-center rounded-full bg-[color:var(--input)] text-[color:var(--text)] hover:bg-gray-200 active:scale-95 transition"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-[color:var(--text)]">
                Bitácora de Movimientos
              </h1>
            </div>

            {/* Filtros */}
            <div className="mb-4 grid grid-cols-3 rounded-full bg-[color:var(--input)] p-1">
              {(["Todos", "Ingresos", "Gastos"] as Filtro[]).map((f) => {
                const active = filtro === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    aria-pressed={active}
                    className={`rounded-full px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                      active
                        ? "bg-white text-[color:var(--text)] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        : "text-[color:var(--text)]/70 hover:text-[color:var(--text)]"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Lista de movimientos */}
            <div className="rounded-2xl bg-[color:var(--input)] p-4">
              {isLoading ? (
                <BitacoraShimmer cantidad={ITEMS_POR_PAGINA} />
              ) : error ? (
                <div className="rounded-xl bg-white p-4 text-center text-red-600">
                  {error}
                </div>
              ) : movimientosPagina.length === 0 ? (
                <div className="rounded-xl bg-white p-4 text-center text-[color:var(--muted,#8a94a3)]">
                  No hay movimientos para mostrar.
                </div>
              ) : (
                <>
                  <ul className="space-y-3" key={`${paginaActual}-${filtro}`}>
                    {movimientosPagina.map((m, index) => (
                      <li
                        key={m.id}
                        onClick={() => handleAbrirDetalle(m.id, m.tipo)}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all animate-[slideInLeft_0.3s_ease-out_forwards] opacity-0"
                        style={{
                          animationDelay: `${index * 30}ms`
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-8 place-items-center rounded-full text-white ${
                              m.tipo === "Ingreso"
                                ? "bg-[color:var(--brand)]"
                                : "bg-[color:var(--muted,#8a94a3)]"
                            }`}
                          >
                            {m.tipo === "Ingreso" ? (
                              <PlusIcon className="h-4 w-4" />
                            ) : (
                              <MinusIcon className="h-4 w-4" />
                            )}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[color:var(--text)]">
                              {m.concepto}
                            </div>
                            <div className="text-xs text-[color:var(--muted,#8a94a3)]">
                              {m.tipo}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-sm font-semibold ${
                            m.tipo === "Ingreso"
                              ? "text-[color:var(--brand)]"
                              : "text-[color:var(--muted,#8a94a3)]"
                          }`}
                        >
                          {m.tipo === "Gasto" ? "-" : "+"}
                          {mxn.format(m.monto)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Paginación */}
                  {totalPaginas > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginaActual === 1}
                        className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-[color:var(--text)] ring-1 ring-black/10 hover:bg-gray-50 active:scale-[.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Anterior
                      </button>

                      <span className="text-xs text-[color:var(--text)]">
                        Página {paginaActual} de {totalPaginas}
                      </span>

                      <button
                        onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                        disabled={paginaActual === totalPaginas}
                        className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-[color:var(--text)] ring-1 ring-black/10 hover:bg-gray-50 active:scale-[.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Información de totales */}
            {!isLoading && !error && (
              <div className="mt-4 text-center text-xs text-[color:var(--muted,#8a94a3)]">
                Mostrando {movimientosPagina.length} de {movimientosFiltrados.length} movimientos
              </div>
            )}
          </div>

          {/* FAB para agregar movimiento */}
          <div className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+var(--tabbar-h,64px)+16px)] z-50">
            <button
              onClick={handleAbrirModal}
              className="grid size-14 place-items-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--brand)" }}
              aria-label="Agregar movimiento"
            >
              <PlusIcon className="h-7 w-7" />
            </button>
          </div>

          {/* Modal de agregar/editar movimiento */}
          <ModalMovimiento
            isOpen={modalAbierto}
            onClose={() => {
              setModalAbierto(false);
              setMovimientoSeleccionado(null);
            }}
            metodosPago={metodosPago}
            onSubmit={handleGuardarMovimiento}
            modoEdicion={movimientoSeleccionado?.datos !== undefined}
            datosIniciales={movimientoSeleccionado?.datos}
          />

          {/* Toast de éxito */}
          <Toast
            mensaje={toastMensaje}
            visible={toastVisible}
            onClose={() => setToastVisible(false)}
          />

          {/* Modal de detalle de movimiento */}
          <ModalDetalleMovimiento
            isOpen={modalDetalleAbierto}
            onClose={() => setModalDetalleAbierto(false)}
            movimientoId={movimientoSeleccionado?.id || null}
            tipo={movimientoSeleccionado?.tipo || null}
            onEditar={handleEditarMovimiento}
            onEliminar={handleEliminarMovimiento}
          />
        </main>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
