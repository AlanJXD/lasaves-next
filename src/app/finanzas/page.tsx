"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { PlusIcon, MinusIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

type Periodo = "Día" | "Semana" | "Mes" | "Año";
type Filtro = "Todos" | "Ingresos" | "Gastos";

export default function FinanzasPage() {
  const [periodo, setPeriodo] = useState<Periodo>("Día");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  // Datos demo
  const { ingresos, gastos } = useMemo(() => {
    switch (periodo) {
      case "Semana":
        return { ingresos: 7240, gastos: 5180 };
      case "Mes":
        return { ingresos: 28450, gastos: 19800 };
      case "Año":
        return { ingresos: 312000, gastos: 271500 };
      default:
        return { ingresos: 865, gastos: 420 };
    }
  }, [periodo]);

  const saldo = ingresos - gastos;
  const data = [
    { name: "Ingresos", value: ingresos, color: "var(--brand)" },
    { name: "Gastos", value: gastos, color: "#8a94a3" },
  ];

  const historialBase = [
    { id: 1, tipo: "Ingreso", categoria: "Nómina", monto: 1200 },
    { id: 2, tipo: "Gasto", categoria: "Restaurante", monto: 35 },
    { id: 3, tipo: "Gasto", categoria: "Supermercado", monto: 82 },
    { id: 4, tipo: "Ingreso", categoria: "Freelance", monto: 300 },
    { id: 5, tipo: "Gasto", categoria: "Transporte", monto: 12 },
  ];

  const historial = historialBase.filter((m) =>
    filtro === "Todos"
      ? true
      : filtro === "Ingresos"
      ? m.tipo === "Ingreso"
      : m.tipo === "Gasto"
  );

  return (
    <main className="px-5 pb-24">
      {/* CABECERA: Brand con media luna */}
      <div className="relative">
        {/* Fondo brand */}
        <div
          className="relative h-36 w-full overflow-hidden rounded-b-[60px]"
          style={{
            background:
              "linear-gradient(135deg, var(--brand) 0%, #2b4c6a 100%)",
          }}
        >
          {/* Media luna decorativa */}
          <div className="absolute left-1/2 top-[90%] h-[160px] w-[160px] -translate-x-1/2 rounded-full bg-white/15 blur-xl" />
        </div>
      </div>

      {/* CARD principal */}
      <section className="-mt-20 relative z-10">
        <div className="mx-auto w-full max-w-md">
          <div className="relative rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            {/* Periodos */}
            <div className="mb-5">
              <div className="grid grid-cols-4 rounded-full bg-[color:var(--input)] p-1">
                {(["Día", "Semana", "Mes", "Año"] as Periodo[]).map((p) => {
                  const active = periodo === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPeriodo(p)}
                      className={`rounded-full px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                        active
                          ? "bg-white text-[color:var(--text)] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                          : "text-[color:var(--text)]/70 hover:text-[color:var(--text)]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donut (Recharts) */}
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
                    >
                      {data.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
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
                                ${saldo.toLocaleString()}
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
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--input)] px-3 py-2">
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: "var(--brand)" }}
                    />
                    Ingresos
                  </span>
                  <span className="text-sm font-medium text-[color:var(--text)]">
                    ${ingresos.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--input)] px-3 py-2">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="inline-block size-2.5 rounded-full bg-[#8a94a3]" />
                    Gastos
                  </span>
                  <span className="text-sm font-medium text-[color:var(--text)]">
                    ${gastos.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón flotante dentro de la card con microinteracción */}
            <button
              aria-label="Agregar movimiento"
              className="absolute right-4 -bottom-6 z-20 grid size-12 place-items-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:scale-105"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
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
              {historial.length === 0 ? (
                <div className="rounded-xl bg-white p-4 text-[#8a94a3]">
                  No hay movimientos para mostrar.
                </div>
              ) : (
                <ul className="space-y-3">
                  {historial.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-8 place-items-center rounded-full text-white ${
                            m.tipo === "Ingreso"
                              ? "bg-[color:var(--brand)]"
                              : "bg-[#8a94a3]"
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
                            {m.categoria}
                          </div>
                          <div className="text-xs text-[#8a94a3]">{m.tipo}</div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          m.tipo === "Ingreso"
                            ? "text-[color:var(--brand)]"
                            : "text-[#8a94a3]"
                        }`}
                      >
                        {m.tipo === "Gasto" ? "-" : "+"}$
                        {m.monto.toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
