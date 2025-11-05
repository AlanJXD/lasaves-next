"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas privadas
 * Redirige al login si el usuario no está autenticado
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent" />
          <p className="mt-4 text-sm text-[#8a94a3]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (redirigirá al login)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
