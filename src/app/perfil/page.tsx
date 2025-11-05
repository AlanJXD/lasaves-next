"use client";

import { useState } from "react";
import {
  UserCircleIcon,
  PencilSquareIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        setIsLoggingOut(false);
      }
    }
  };

  const nombreCompleto = user
    ? `${user.nombre} ${user.apellido_paterno}${user.apellido_materno ? " " + user.apellido_materno : ""}`
    : "";

  return (
    <ProtectedRoute>
      <main
        className="relative px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
          paddingBottom:
            "calc(env(safe-area-inset-bottom, 0px) + var(--tabbar-h, 64px) + 32px)",
        }}
      >
        <div className="mx-auto w-full max-w-md">
          {/* Encabezado */}
          <h1 className="py-4 text-xl font-semibold text-[color:var(--text)] text-center">
            Perfil
          </h1>

          {/* Icono y datos del usuario */}
          <section className="flex flex-col items-center text-center mt-2">
            <UserCircleIcon
              className="h-28 w-28 text-[color:var(--brand)]/90"
              aria-hidden="true"
            />
            <h2 className="mt-3 text-lg font-semibold text-[color:var(--text)]">
              {nombreCompleto}
            </h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <span className="mt-3 rounded-full bg-[color:var(--input)] px-3 py-1 text-xs font-medium text-[color:var(--text)]/80">
              {user?.roles.join(", ")}
            </span>
          </section>

        {/* Cards de acciones */}
        <section className="mt-8 space-y-3">
          {/* Card: Editar Perfil */}
          <button
            type="button"
            onClick={() => alert("Editar perfil")}
            className="flex items-center gap-3 w-full rounded-2xl bg-white px-5 py-4 text-left text-[color:var(--text)] ring-1 ring-black/10 active:translate-y-[1px] active:scale-[.995] transition-transform touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <PencilSquareIcon className="h-5 w-5 opacity-70" />
            <span className="font-medium">Editar Perfil</span>
          </button>

          {/* Card: Cambiar Contraseña */}
          <button
            type="button"
            onClick={() => alert("Cambiar contraseña")}
            className="flex items-center gap-3 w-full rounded-2xl bg-white px-5 py-4 text-left text-[color:var(--text)] ring-1 ring-black/10 active:translate-y-[1px] active:scale-[.995] transition-transform touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <KeyIcon className="h-5 w-5 opacity-70" />
            <span className="font-medium">Cambiar Contraseña</span>
          </button>

          {/* Card: Cerrar Sesión */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full rounded-2xl bg-white px-5 py-4 text-left text-red-600 ring-1 ring-black/10 active:translate-y-[1px] active:scale-[.995] transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 opacity-70" />
            <span className="font-medium">
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            </span>
          </button>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
