/**
 * Componentes Shimmer para la página de Finanzas
 * Muestra placeholders animados mientras se cargan los datos
 */

export function GraficaShimmer() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Shimmer del donut chart */}
      <div className="relative w-full flex items-center justify-center" style={{ height: 180 }}>
        <div className="relative">
          {/* Anillo exterior */}
          <div className="h-40 w-40 rounded-full bg-gradient-to-r from-[color:var(--input)] via-gray-200 to-[color:var(--input)] animate-pulse" />
          {/* Círculo interior (para simular el donut) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[116px] w-[116px] rounded-full bg-white" />
          </div>
          {/* Texto central shimmer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-24 rounded bg-gray-300 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Shimmer del resumen (Ingresos y Gastos) */}
      <div className="grid w-full grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-[color:var(--input)] px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-full bg-gray-300 animate-pulse" />
              <span className="h-3 w-14 rounded bg-gray-300 animate-pulse" />
            </span>
            <span className="h-3 w-16 rounded bg-gray-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistorialShimmer() {
  return (
    <div className="rounded-2xl bg-[color:var(--input)] p-4">
      <ul className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {/* Icono shimmer */}
              <span className="size-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                {/* Título shimmer */}
                <div className="h-3 w-32 rounded bg-gray-300 animate-pulse" />
                {/* Subtítulo shimmer */}
                <div className="h-2 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
            {/* Monto shimmer */}
            <div className="h-3 w-20 rounded bg-gray-300 animate-pulse" />
          </li>
        ))}
      </ul>

      {/* Botón "Ver más" shimmer */}
      <div className="mt-4 text-center">
        <div className="inline-flex h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

interface FinanzasShimmerProps {
  onAbrirModal?: () => void;
}

/**
 * Shimmer completo para toda la sección principal de finanzas
 */
export function FinanzasShimmer({ onAbrirModal }: FinanzasShimmerProps) {
  return (
    <section className="-mt-16 relative z-10">
      <div className="mx-auto w-full max-w-md">
        <div className="relative rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {/* Periodos shimmer */}
          <div className="mb-5">
            <div className="grid grid-cols-4 rounded-full bg-[color:var(--input)] p-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-7 rounded-full bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Gráfica shimmer */}
          <GraficaShimmer />

          {/* FAB real (funcional incluso durante carga) */}
          {onAbrirModal && (
            <div className="absolute right-4 -bottom-6 z-20">
              <button
                onClick={onAbrirModal}
                className="grid size-12 place-items-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--brand)" }}
                aria-label="Agregar movimiento"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* HISTORIAL shimmer */}
        <div className="mt-8">
          {/* Filtros shimmer */}
          <div className="mb-3 grid grid-cols-3 rounded-full bg-[color:var(--input)] p-1 gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 rounded-full bg-gray-200 animate-pulse"
              />
            ))}
          </div>

          {/* Lista shimmer */}
          <HistorialShimmer />
        </div>
      </div>
    </section>
  );
}
