"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Module } from "@/lib/authorization";
import { useAuthorization } from "@/hooks/useAuthorization";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  module: Module;
  fallbackPath?: string;
}

/**
 * Componente que protege rutas según el rol del usuario
 * Redirige si el usuario no tiene acceso al módulo
 */
export default function RoleProtectedRoute({
  children,
  module,
  fallbackPath = "/perfil"
}: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { canAccessModule } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, no hacer nada (ProtectedRoute se encargará)
    if (!isLoading && isAuthenticated) {
      // Verificar si tiene acceso al módulo
      if (!canAccessModule(module)) {
        router.push(fallbackPath);
      }
    }
  }, [isLoading, isAuthenticated, canAccessModule, module, fallbackPath, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent" />
          <p className="mt-4 text-sm text-[#8a94a3]">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene acceso, no renderizar nada (redirigirá)
  if (isAuthenticated && !canAccessModule(module)) {
    return null;
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
}
