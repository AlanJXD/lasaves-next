"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, tokenStorage, Usuario, LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Limpia la sesión y redirige al login
   */
  const clearSession = () => {
    tokenStorage.clearAll();
    setUser(null);
    setAccessToken(null);
  };

  // El refresh ahora se hace automáticamente antes de cada petición en authService.authenticatedFetch

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearSession();
      router.push('/login');
    }
  };

  /**
   * Inicializa la sesión al cargar la aplicación
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = tokenStorage.getUser();
        const storedAccessToken = tokenStorage.getAccessToken();
        const storedRefreshToken = tokenStorage.getRefreshToken();

        // Si hay datos guardados, restaurar la sesión
        if (storedUser && storedAccessToken && storedRefreshToken) {
          setUser(storedUser);
          setAccessToken(storedAccessToken);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Sin dependencias, solo se ejecuta una vez

  /**
   * Maneja el inicio de sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      // Guardar tokens y usuario
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      tokenStorage.setUser(response.usuario);

      // Actualizar estado
      setUser(response.usuario);
      setAccessToken(response.accessToken);

      // Redirigir a home
      router.push('/');
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
