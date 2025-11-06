// Tipos de respuesta de la API
export interface Usuario {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  recordarme?: boolean;
}

// Configuración de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Variable para controlar si ya hay un refresh en progreso
let refreshPromise: Promise<RefreshResponse> | null = null;

// Helper para decodificar JWT sin validar firma
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Helper para verificar si el token está próximo a expirar (en menos de 2 minutos)
function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;

  // Si expira en menos de 2 minutos, renovarlo
  return timeUntilExpiry < 120;
}

// Servicio de autenticación
export const authService = {
  /**
   * Inicia sesión con email y password
   * @param credentials - Email, password y opción recordarme
   * @returns Tokens y datos del usuario
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    return response.json();
  },

  /**
   * Renueva el access token usando el refresh token
   * @param refreshToken - Token de refresco
   * @returns Nuevos tokens
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al renovar token');
    }

    return response.json();
  },

  /**
   * Cierra la sesión y revoca el refresh token
   * @param refreshToken - Token de refresco a revocar
   */
  async logout(refreshToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cerrar sesión');
    }
  },

  /**
   * Realiza una petición autenticada a la API con refresh automático
   * @param endpoint - Endpoint de la API (ej: '/api/usuarios')
   * @param options - Opciones de fetch
   */
  async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Obtener tokens actuales
    let accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    // Si no hay tokens, rechazar
    if (!accessToken || !refreshToken) {
      throw new Error('No hay sesión activa');
    }

    // Verificar si el token está próximo a expirar y renovarlo si es necesario
    if (isTokenExpiringSoon(accessToken)) {
      // Si ya hay un refresh en progreso, esperar a que termine
      if (!refreshPromise) {
        refreshPromise = this.refresh(refreshToken)
          .then((response) => {
            tokenStorage.setTokens(response.accessToken, response.refreshToken);
            refreshPromise = null;
            return response;
          })
          .catch((error) => {
            refreshPromise = null;
            // Si falla el refresh, limpiar tokens y rechazar
            tokenStorage.clearAll();
            throw error;
          });
      }

      try {
        const response = await refreshPromise;
        accessToken = response.accessToken;
      } catch (error) {
        throw new Error('Sesión expirada');
      }
    }

    // Realizar la petición con el token válido
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        // Solo agregar Content-Type si hay body y no es FormData
        ...(options.body && !(options.body instanceof FormData) && {
          'Content-Type': 'application/json',
        }),
      },
    });

    // Si aún así recibimos 401, intentar un refresh y reintentar UNA vez
    if (response.status === 401 && !refreshPromise) {
      try {
        const refreshResponse = await this.refresh(refreshToken);
        tokenStorage.setTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

        // Reintentar la petición con el nuevo token
        return fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshResponse.accessToken}`,
            // Solo agregar Content-Type si hay body y no es FormData
            ...(options.body && !(options.body instanceof FormData) && {
              'Content-Type': 'application/json',
            }),
          },
        });
      } catch (error) {
        // Si falla, limpiar tokens
        tokenStorage.clearAll();
        throw new Error('Sesión expirada');
      }
    }

    return response;
  },
};

// Utilidades para manejo de tokens en localStorage
export const tokenStorage = {
  /**
   * Guarda los tokens en localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Obtiene el access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },

  /**
   * Elimina los tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Guarda los datos del usuario
   */
  setUser(usuario: Usuario): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(usuario));
  },

  /**
   * Obtiene los datos del usuario
   */
  getUser(): Usuario | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Elimina los datos del usuario
   */
  clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  },

  /**
   * Limpia todo el almacenamiento de autenticación
   */
  clearAll(): void {
    this.clearTokens();
    this.clearUser();
  },
};
