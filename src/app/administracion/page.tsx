import Link from "next/link";
import {
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

export default function AdministracionPage() {
  return (
    <main className="px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-xl font-semibold text-[color:var(--text)] text-center">
          Administración
        </h1>

        {/* Grid de cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* Card: Usuarios */}
          <Link
            href="/administracion/usuarios"
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[.99] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/30 focus-visible:ring-offset-2"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Overlay de presión */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-150 group-active:opacity-100"
            />
            {/* Shine opcional */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-6 h-10 animate-shine"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                <UserGroupIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[color:var(--text)]">
                  Usuarios
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  Alta, edición y desactivación de cuentas de usuario.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--input)] px-2.5 py-1 text-xs font-medium text-[color:var(--text)]/80">
                    128 activos
                  </span>
                  <span className="rounded-full bg-[color:var(--input)] px-2.5 py-1 text-xs font-medium text-[color:var(--text)]/60">
                    7 pendientes
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: Roles y Permisos */}
          <Link
            href="/administracion/roles-permisos"
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[.99] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/30 focus-visible:ring-offset-2"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Overlay de presión */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-150 group-active:opacity-100"
            />
            {/* Shine opcional */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-6 h-10 animate-shine"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                <ShieldCheckIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[color:var(--text)]">
                  Roles y Permisos
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  Define qué puede ver y hacer cada rol dentro del sistema.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--input)] px-2.5 py-1 text-xs font-medium text-[color:var(--text)]/80">
                    5 roles
                  </span>
                  <span className="rounded-full bg-[color:var(--input)] px-2.5 py-1 text-xs font-medium text-[color:var(--text)]/60">
                    42 permisos
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
