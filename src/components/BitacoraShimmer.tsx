/**
 * Componente Shimmer para la bitácora de movimientos
 * Muestra placeholders animados mientras se cargan los movimientos
 */

interface BitacoraShimmerProps {
  cantidad?: number;
}

export default function BitacoraShimmer({ cantidad = 20 }: BitacoraShimmerProps) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: cantidad }).map((_, i) => (
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
  );
}
