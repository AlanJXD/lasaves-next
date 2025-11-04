"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  // Evita mismatch: no renders “reactivos” hasta montar en cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <main className="relative min-h-screen w-full bg-white text-[color:var(--text)]">
      {/* Barras blancas tipo status bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[env(safe-area-inset-top,20px)] bg-white" />

      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-5 pt-[env(safe-area-inset-top,20px)] pb-[env(safe-area-inset-bottom,20px)]">
        {/* Ilustración */}
        <div className="mb-7">
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-[color:var(--input)]"
            style={{ aspectRatio: "16 / 9" }}
          >
            <div className="absolute inset-0 grid place-items-center text-[#8a94a3] text-sm">
              Espacio para tu ilustración
            </div>
          </div>
        </div>

        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Inicio de Sesión</h1>
          <p className="mt-1 text-sm text-[#8a94a3]">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form className="space-y-5" suppressHydrationWarning>
          {/* Email */}
          <label className="block">
            <span className="mb-2 block text-sm">Correo electrónico</span>
            <div className="relative">
              {/* Ícono fijo (no depende del cliente) */}
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c8796] h-5 w-5" />
              <input
                type="email"
                placeholder="tu@correo.com"
                className="w-full rounded-2xl border border-[#e7e7ee] bg-[color:var(--input)] px-11 py-3 text-sm outline-none transition focus:border-[color:var(--brand)]"
                autoComplete="username"
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="mb-2 block text-sm">Contraseña</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c8796] h-5 w-5" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[#e7e7ee] bg-[color:var(--input)] px-11 py-3 pr-12 text-sm outline-none transition focus:border-[color:var(--brand)]"
                autoComplete="current-password"
              />
              {/* Botón mostrar/ocultar solo después de montar (evita mismatch) */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c8796] hover:text-[color:var(--brand)]"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </div>
          </label>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between pt-1">
            {/* Switch solo visual, estable en SSR/cliente */}
            <button
              type="button"
              onClick={() => setRemember((v) => !v)}
              className="inline-flex select-none items-center gap-2"
            >
              <div
                className={`h-5 w-10 rounded-full transition ${
                  remember ? "bg-[color:var(--brand)]" : "bg-[#d2d7de]"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    remember ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm">Recordarme</span>
            </button>

            {/* Evita href="#" para no mover el hash antes de hidratar */}
            <Link
              href="/forgot"
              className="text-sm underline decoration-[color:var(--text)]/30 underline-offset-4 hover:opacity-80"
              prefetch={false}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón principal */}
          <button
            type="button"
            className="mt-4 w-full rounded-full px-5 py-3 text-center text-[15px] font-medium text-white shadow-sm transition hover:opacity-90 active:opacity-100"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Iniciar sesión
          </button>
        </form>
      </div>

      {/* Barra inferior blanca */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[env(safe-area-inset-bottom,20px)] bg-white" />
    </main>
  );
}
