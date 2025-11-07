/**
 * Componente Shimmer para la página de Inicio
 * Muestra placeholders animados mientras se cargan las estadísticas
 */

export default function InicioShimmer() {
  return (
    <section className="grid grid-cols-2 grid-rows-2 gap-6">
      {/* Card 1: Ingresos */}
      <article className="rounded-2xl bg-[#f6f5f9] p-6 h-44 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
        <div className="mt-3 h-7 w-32 rounded bg-gray-300 animate-pulse" />
        <div className="mt-1 h-3 w-24 rounded bg-gray-200 animate-pulse" />
      </article>

      {/* Card 2: Gastos */}
      <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
        <div className="mt-3 h-8 w-36 rounded bg-gray-300 animate-pulse" />
        <div className="mt-1 h-3 w-24 rounded bg-gray-200 animate-pulse" />
      </article>

      {/* Card 3: Movimientos */}
      <article className="rounded-2xl bg-[#f6f5f9] p-6 h-48 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="mt-3 h-8 w-20 rounded bg-gray-300 animate-pulse" />
        <div className="mt-1 h-3 w-28 rounded bg-gray-200 animate-pulse" />
      </article>

      {/* Card 4: Balance */}
      <article
        className="rounded-2xl p-6 h-44 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        style={{
          background: "linear-gradient(135deg, var(--brand) 0%, #2b4c6a 100%)",
        }}
      >
        <div className="h-3 w-28 rounded bg-white/30 animate-pulse" />
        <div className="mt-3 h-7 w-32 rounded bg-white/40 animate-pulse" />
        <div className="mt-1 h-3 w-20 rounded bg-white/30 animate-pulse" />
      </article>
    </section>
  );
}
