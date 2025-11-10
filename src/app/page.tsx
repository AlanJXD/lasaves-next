"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function InicioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de finanzas
    router.replace("/finanzas");
  }, [router]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent" />
          <p className="mt-4 text-sm text-[color:var(--muted,#8a94a3)]">
            Redirigiendo...
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
