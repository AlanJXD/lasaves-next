import { useAuth } from '@/contexts/AuthContext';
import { hasAccessToModule, hasAnyRole, isAdmin, Module } from '@/lib/authorization';

/**
 * Hook personalizado para manejar autorización basada en roles
 */
export function useAuthorization() {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  return {
    /**
     * Verifica si el usuario tiene acceso a un módulo
     */
    canAccessModule: (module: Module) => hasAccessToModule(userRoles, module),

    /**
     * Verifica si el usuario tiene alguno de los roles especificados
     */
    hasRole: (...roles: string[]) => hasAnyRole(userRoles, roles),

    /**
     * Verifica si el usuario es administrador
     */
    isAdmin: () => isAdmin(userRoles),

    /**
     * Retorna los roles del usuario
     */
    roles: userRoles,
  };
}
