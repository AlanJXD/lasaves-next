// lib/navOrder.ts
export const NAV_ORDER = ["/", "/finanzas", "/administracion"];

/** Normaliza un pathname a su primer segmento (ej. "/finanzas/ingresos" -> "/finanzas") */
export function baseRoute(path: string) {
  if (!path) return "/";
  const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "/";
}
