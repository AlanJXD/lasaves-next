"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import ProtectedRoute from "@/components/ProtectedRoute";
import ModalMovimiento from "@/components/ModalMovimiento";
import ModalDetalleMovimiento from "@/components/ModalDetalleMovimiento";
import Toast from "@/components/Toast";
import { finanzasService, Gasto, Ingreso, MetodoPago } from "@/lib/finanzas";

type Periodo = "General" | "Día" | "Semana" | "Mes";
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

// Helper para calcular fechas según periodo
function calcularFechas(periodo: Periodo): {
  fecha_inicio?: string;
  fecha_fin?: string;
} {
  const ahora = new Date();
  const fin = ahora.toISOString();

  switch (periodo) {
    case "Día": {
      const inicio = new Date(ahora);
      inicio.setHours(0, 0, 0, 0);
      return { fecha_inicio: inicio.toISOString(), fecha_fin: fin };
    }
    case "Semana": {
      const inicio = new Date(ahora);
      inicio.setDate(inicio.getDate() - 7);
      return { fecha_inicio: inicio.toISOString(), fecha_fin: fin };
    }
    case "Mes": {
      const inicio = new Date(ahora);
      inicio.setMonth(inicio.getMonth() - 1);
      return { fecha_inicio: inicio.toISOString(), fecha_fin: fin };
    }
    case "General":
    default:
      return {};
  }
}

export default function FinanzasPage() {
  const [periodo, setPeriodo] = useState<Periodo>("General");
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<{
    id: string;
    tipo: "Ingreso" | "Gasto";
    datos?: any;
  } | null>(null);

  // Estado de datos
  const [ingresos, setIngresos] = useState(0);
  const [gastos, setGastos] = useState(0);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("Movimiento agregado exitosamente");

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

  // Cargar datos cuando cambia el periodo
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const fechas = calcularFechas(periodo);

      // Cargar estadísticas e historial en paralelo
      const [statsIngresos, statsGastos, listaIngresos, listaGastos] =
        await Promise.all([
          finanzasService.obtenerEstadisticasIngresos(fechas),
          finanzasService.obtenerEstadisticasGastos(fechas),
          finanzasService.listarIngresos({ ...fechas, limite: 10 }),
          finanzasService.listarGastos({ ...fechas, limite: 10 }),
        ]);

      // Actualizar totales
      setIngresos(parseFloat(statsIngresos.total._sum.monto || "0"));
      setGastos(parseFloat(statsGastos.total._sum.monto || "0"));

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
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

  const handleAbrirDetalle = (id: string, tipo: "Ingreso" | "Gasto") => {
    setMovimientoSeleccionado({ id, tipo });
    setModalDetalleAbierto(true);
  };

  const handleEditarMovimiento = (id: number, tipo: "Ingreso" | "Gasto", detalles: any) => {
    // Cerrar modal de detalle
    setModalDetalleAbierto(false);

    // Abrir modal de edición con los datos
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

    // Necesitamos pasar estos datos al modal
    setMovimientoSeleccionado({ id: `${tipo === "Ingreso" ? 'i' : 'g'}-${id}`, tipo, datos: datosEdicion });
    setModalAbierto(true);
  };

  const handleEliminarMovimiento = async (id: number, tipo: "Ingreso" | "Gasto") => {
    try {
      // Optimistic update: remover de la lista inmediatamente
      const movimientoId = `${tipo === "Ingreso" ? 'i' : 'g'}-${id}`;
      const movimientoEliminado = movimientos.find(m => m.id === movimientoId);

      if (movimientoEliminado) {
        // Actualizar estados
        if (tipo === "Ingreso") {
          setIngresos(prev => prev - movimientoEliminado.monto);
        } else {
          setGastos(prev => prev - movimientoEliminado.monto);
        }

        setMovimientos(prev => prev.filter(m => m.id !== movimientoId));
      }

      // Llamar a la API
      if (tipo === "Ingreso") {
        await finanzasService.eliminarIngreso(id);
      } else {
        await finanzasService.eliminarGasto(id);
      }

      // Mostrar toast de éxito
      setToastMensaje("Movimiento eliminado exitosamente");
      setToastVisible(true);
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Error al reproducir sonido:", err);
        });
      }
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      // Recargar datos si falla
      cargarDatos();
    }
  };

  const handleGuardarMovimiento = async (
    formData: FormData,
    tipo: "ingreso" | "gasto"
  ) => {
    const comprobanteFile = formData.get("comprobante");
    const esEdicion = movimientoSeleccionado?.datos !== undefined;

    console.log('📋 FormData recibido:', {
      concepto: formData.get("concepto"),
      monto: formData.get("monto"),
      metodo_pago_id: formData.get("metodo_pago_id"),
      servicio_id: formData.get("servicio_id"),
      comprobante: comprobanteFile,
      esFile: comprobanteFile instanceof File,
      nombre: comprobanteFile instanceof File ? comprobanteFile.name : null,
      esEdicion
    });

    const data = {
      concepto: formData.get("concepto") as string,
      monto: parseFloat(formData.get("monto") as string),
      metodo_pago_id: parseInt(formData.get("metodo_pago_id") as string),
      servicio_id: formData.get("servicio_id") ? parseInt(formData.get("servicio_id") as string) : undefined,
      notas: formData.get("notas") as string | undefined,
      comprobante: comprobanteFile instanceof File ? comprobanteFile : undefined,
    };

    if (esEdicion) {
      // MODO EDICIÓN
      const movimientoId = movimientoSeleccionado!.datos.id;
      const movimientoIdStr = `${tipo === "ingreso" ? 'i' : 'g'}-${movimientoId}`;
      const movimientoAnterior = movimientos.find(m => m.id === movimientoIdStr);

      // Guardar estados anteriores
      const ingresosAnterior = ingresos;
      const gastosAnterior = gastos;
      const movimientosAnterior = movimientos;

      try {
        // Actualizar optimistamente
        if (movimientoAnterior) {
          // Restar el monto anterior y sumar el nuevo
          if (tipo === "ingreso") {
            setIngresos(prev => prev - movimientoAnterior.monto + data.monto);
          } else {
            setGastos(prev => prev - movimientoAnterior.monto + data.monto);
          }

          // Actualizar el movimiento en la lista
          setMovimientos(prev => prev.map(m =>
            m.id === movimientoIdStr
              ? { ...m, concepto: data.concepto, monto: data.monto }
              : m
          ));
        }

        // Llamar a la API
        if (tipo === "ingreso") {
          await finanzasService.actualizarIngreso(movimientoId, data);
        } else {
          await finanzasService.actualizarGasto(movimientoId, data);
        }

        // Éxito
        setToastMensaje("Movimiento actualizado exitosamente");
        setToastVisible(true);
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error al reproducir sonido:", err);
          });
        }

        // Limpiar selección
        setMovimientoSeleccionado(null);
      } catch (err) {
        console.error("Error al actualizar movimiento:", err);

        // REVERTIR cambios
        setIngresos(ingresosAnterior);
        setGastos(gastosAnterior);
        setMovimientos(movimientosAnterior);

        throw err;
      }
    } else {
      // MODO CREACIÓN
      const nuevoMovimiento: Movimiento = {
        id: `temp-${Date.now()}`,
        tipo: tipo === "ingreso" ? "Ingreso" : "Gasto",
        concepto: data.concepto,
        monto: data.monto,
        fecha: new Date().toISOString(),
      };

      // Guardar estados anteriores
      const ingresosAnterior = ingresos;
      const gastosAnterior = gastos;
      const movimientosAnterior = movimientos;

      try {
        // ACTUALIZACIÓN OPTIMISTA
        if (tipo === "ingreso") {
          setIngresos(prev => prev + data.monto);
        } else {
          setGastos(prev => prev + data.monto);
        }

        // Agregar el nuevo movimiento al inicio
        setMovimientos(prev => [nuevoMovimiento, ...prev]);

        // Llamar a la API
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

        // Éxito
        setToastMensaje("Movimiento agregado exitosamente");
        setToastVisible(true);
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error al reproducir sonido:", err);
          });
        }
      } catch (err) {
        console.error("Error al guardar movimiento:", err);

        // REVERTIR cambios
        setIngresos(ingresosAnterior);
        setGastos(gastosAnterior);
        setMovimientos(movimientosAnterior);

        throw err;
      }
    }
  };

  const saldo = useMemo(() => ingresos - gastos, [ingresos, gastos]);

  const data = useMemo(
    () => [
      { name: "Ingresos", value: ingresos || 0, color: "var(--brand)" },
      { name: "Gastos", value: gastos || 0, color: "var(--muted, #8a94a3)" },
    ],
    [ingresos, gastos]
  );

  const historialFiltrado = useMemo(() => {
    if (filtro === "Todos") return movimientos;
    return movimientos.filter((m) =>
      filtro === "Ingresos" ? m.tipo === "Ingreso" : m.tipo === "Gasto"
    );
  }, [filtro, movimientos]);

  return (
    <ProtectedRoute>
      <main
        className="relative px-5 pb-24"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 140px)",
          paddingBottom:
            "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))",
        }}
      >
        {/* BRAND: media luna invertida full-bleed detrás */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-0 h-[200px] w-screen -translate-x-1/2"
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 H100 V68 Q50,100 0,68 Z" fill="var(--brand)" />
          </svg>
        </div>

        {/* CARD principal flotando sobre la media luna */}
        <section className="-mt-16 relative z-10">
          <div className="mx-auto w-full max-w-md">
            <div className="relative rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              {/* Periodos */}
              <div className="mb-5">
                <div className="grid grid-cols-4 rounded-full bg-[color:var(--input)] p-1">
                  {(["General", "Día", "Semana", "Mes"] as Periodo[]).map(
                    (p) => {
                      const active = periodo === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPeriodo(p)}
                          aria-pressed={active}
                          className={`rounded-full px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                            active
                              ? "bg-white text-[color:var(--text)] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                              : "text-[color:var(--text)]/70 hover:text-[color:var(--text)]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Donut Chart */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={58}
                        outerRadius={80}
                        stroke="transparent"
                        isAnimationActive={false}
                      >
                        {data.map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                        <Label
                          position="center"
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (
                              !viewBox ||
                              typeof viewBox.cx !== "number" ||
                              typeof viewBox.cy !== "number"
                            )
                              return null;
                            return (
                              <g>
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy - 12}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill="#8a94a3"
                                >
                                  {periodo.toUpperCase()}
                                </text>
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy + 8}
                                  textAnchor="middle"
                                  fontSize="20"
                                  fontWeight={600}
                                  fill="currentColor"
                                  className="text-[color:var(--text)]"
                                >
                                  {mxn.format(saldo)}
                                </text>
                              </g>
                            );
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Resumen compacto */}
                <div className="grid w-full grid-cols-2 gap-3">
                  {[
                    {
                      label: "Ingresos",
                      color: "var(--brand)",
                      valor: ingresos,
                    },
                    {
                      label: "Gastos",
                      color: "var(--muted,#8a94a3)",
                      valor: gastos,
                    },
                  ].map((item) => {
                    const texto = mxn.format(item.valor);

                    // Tamaño dinámico por longitud (px) – inline para que SIEMPRE gane
                    const fontPx =
                      texto.length > 15
                        ? 9
                        : texto.length > 13
                        ? 10
                        : texto.length > 11
                        ? 11
                        : 14; // 14px ≈ text-sm

                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl bg-[color:var(--input)] px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span
                            className="inline-block size-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </span>

                        <span
                          className="font-medium text-[color:var(--text)] leading-none transition-all duration-200 ease-in-out"
                          style={{
                            fontSize: `${fontPx}px`, // ← prioridad máxima
                            fontVariantNumeric: "tabular-nums",
                            fontFeatureSettings: "'tnum'",
                          }}
                        >
                          {texto}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FAB */}
              <div className="absolute right-4 -bottom-6 z-20">
                <button
                  onClick={handleAbrirModal}
                  className="grid size-12 place-items-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--brand)" }}
                  aria-label="Agregar movimiento"
                >
                  <PlusIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* HISTORIAL */}
            <div className="mt-8">
              {/* Filtros */}
              <div className="mb-3 grid grid-cols-3 rounded-full bg-[color:var(--input)] p-1">
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
                  <div className="rounded-xl bg-white p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent" />
                    <p className="mt-2 text-sm text-[color:var(--muted,#8a94a3)]">
                      Cargando...
                    </p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl bg-white p-4 text-center text-red-600">
                    {error}
                  </div>
                ) : historialFiltrado.length === 0 ? (
                  <div className="rounded-xl bg-white p-4 text-center text-[color:var(--muted,#8a94a3)]">
                    No hay movimientos para mostrar.
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {historialFiltrado.map((m) => (
                        <li
                          key={m.id}
                          onClick={() => handleAbrirDetalle(m.id, m.tipo)}
                          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
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

                    {/* Ver más */}
                    <div className="mt-4 text-center">
                      <Link
                        href="/finanzas/bitacora"
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-[color:var(--text)] ring-1 ring-black/10 hover:bg-[color:var(--input)] active:scale-[.98] transition"
                      >
                        Ver más
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

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
    </ProtectedRoute>
  );
}
