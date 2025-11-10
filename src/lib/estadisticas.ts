import { authService } from './auth';

// Tipos de respuesta de la API
export interface EstadisticasIngresos {
  total: number;
  cantidad: number;
  promedio: number;
}

export interface EstadisticasGastos {
  total: number;
  cantidad: number;
  promedio: number;
}

export interface EstadisticasBalance {
  ingresos: number;
  gastos: number;
  balance: number;
  movimientos_totales: number;
}

export interface EstadisticasResumen {
  ingresos: EstadisticasIngresos;
  gastos: EstadisticasGastos;
  balance: number;
  movimientos_totales: number;
}

export interface EstadisticasMovimientos {
  total: number;
  ingresos: number;
  gastos: number;
}

// Servicio de estadísticas
export const estadisticasService = {
  /**
   * Obtiene resumen completo de estadísticas
   * Este endpoint es el más eficiente ya que retorna todo en una sola petición
   */
  async obtenerResumen(): Promise<EstadisticasResumen> {
    const response = await authService.authenticatedFetch('/api/estadisticas/resumen');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener resumen de estadísticas');
    }

    return response.json();
  },

  /**
   * Obtiene estadísticas de ingresos
   */
  async obtenerIngresos(): Promise<EstadisticasIngresos> {
    const response = await authService.authenticatedFetch('/api/estadisticas/ingresos');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener estadísticas de ingresos');
    }

    return response.json();
  },

  /**.
   * Obtiene estadísticas de gastos
   */
  async obtenerGastos(): Promise<EstadisticasGastos> {
    const response = await authService.authenticatedFetch('/api/estadisticas/gastos');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener estadísticas de gastos');
    }

    return response.json();
  },

  /**
   * Obtiene balance general
   */
  async obtenerBalance(): Promise<EstadisticasBalance> {
    const response = await authService.authenticatedFetch('/api/estadisticas/balance');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener balance general');
    }

    return response.json();
  },

  /**
   * Obtiene total de movimientos
   */
  async obtenerMovimientos(): Promise<EstadisticasMovimientos> {
    const response = await authService.authenticatedFetch('/api/estadisticas/movimientos');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener total de movimientos');
    }

    return response.json();
  },
};
