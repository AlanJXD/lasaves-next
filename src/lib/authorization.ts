/**
 * Definición de módulos y sus roles permitidos
 */
export const MODULES = {
  INICIO: 'inicio',
  FINANZAS: 'finanzas',
  ADMINISTRACION: 'administracion',
  PERFIL: 'perfil',
} as const;

export type Module = typeof MODULES[keyof typeof MODULES];

/**
 * Mapa de módulos y los roles que tienen acceso
 */
export const MODULE_ROLES: Record<Module, string[]> = {
  [MODULES.INICIO]: ['admin', 'socio'],
  [MODULES.FINANZAS]: ['admin', 'socio'],
  [MODULES.ADMINISTRACION]: ['admin'],
  [MODULES.PERFIL]: ['admin', 'socio', 'enfermero'],
};

/**
 * Verifica si el usuario tiene acceso a un módulo específico
 * @param userRoles - Array de roles del usuario
 * @param module - Módulo a verificar
 * @returns true si el usuario tiene acceso, false en caso contrario
 */
export function hasAccessToModule(userRoles: string[], module: Module): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  const allowedRoles = MODULE_ROLES[module];
  return userRoles.some(role => allowedRoles.includes(role));
}

/**
 * Verifica si el usuario tiene al menos uno de los roles especificados
 * @param userRoles - Array de roles del usuario
 * @param requiredRoles - Array de roles requeridos
 * @returns true si el usuario tiene al menos uno de los roles, false en caso contrario
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some(role => requiredRoles.includes(role));
}

/**
 * Verifica si el usuario es administrador
 * @param userRoles - Array de roles del usuario
 * @returns true si el usuario es admin, false en caso contrario
 */
export function isAdmin(userRoles: string[]): boolean {
  return userRoles?.includes('admin') ?? false;
}
