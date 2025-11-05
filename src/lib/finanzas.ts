import { authService } from './auth';

// Tipos
export interface MetodoPago {
  id_metodo: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string | null;
  costo_referencia: string;
}

export interface Gasto {
  id_gasto: number;
  concepto: string;
  monto: string;
  fecha_gasto: string;
  comprobante_url?: string | null;
  notas?: string | null;
  fecha_registro: string;
  metodo_pago: {
    id_metodo: number;
    nombre: string;
  };
  usuario_registro: {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
  };
}

export interface Ingreso {
  id_ingreso: number;
  concepto?: string | null;
  monto: string;
  fecha_ingreso: string;
  comprobante_url?: string | null;
  notas?: string | null;
  fecha_registro: string;
  servicio?: {
    id_servicio: number;
    nombre: string;
    costo_referencia: string;
  } | null;
  metodo_pago: {
    id_metodo: number;
    nombre: string;
  };
  usuario_registro: {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
  };
}

export interface EstadisticasGastos {
  total: {
    _sum: { monto: string };
    _count: number;
    _avg: { monto: string };
  };
  por_metodo: Array<{
    metodo_pago_id: number;
    _sum: { monto: string };
    _count: number;
  }>;
}

export interface EstadisticasIngresos {
  total: {
    _sum: { monto: string };
    _count: number;
    _avg: { monto: string };
  };
  por_servicio: Array<{
    servicio_id: number | null;
    _sum: { monto: string };
    _count: number;
  }>;
  por_metodo: Array<{
    metodo_pago_id: number;
    _sum: { monto: string };
    _count: number;
  }>;
}

// Servicio de finanzas
export const finanzasService = {
  // ==================== GASTOS ====================

  /**
   * Lista todos los gastos con filtros
   */
  async listarGastos(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    metodo_pago_id?: number;
    limite?: number;
    offset?: number;
  }): Promise<{ gastos: Gasto[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append('fecha_fin', params.fecha_fin);
    if (params?.metodo_pago_id) searchParams.append('metodo_pago_id', params.metodo_pago_id.toString());
    if (params?.limite) searchParams.append('limite', params.limite.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await authService.authenticatedFetch(
      `/api/gastos?${searchParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener gastos');
    }

    return response.json();
  },

  /**
   * Crea un nuevo gasto
   */
  async crearGasto(data: {
    concepto: string;
    monto: number;
    fecha_gasto: string;
    metodo_pago_id: number;
    notas?: string;
    comprobante?: File;
  }): Promise<{ mensaje: string; gasto: Gasto }> {
    let body: FormData | string;
    let headers: Record<string, string> = {};

    if (data.comprobante) {
      // Con archivo, usar FormData
      const formData = new FormData();
      formData.append('concepto', data.concepto);
      formData.append('monto', data.monto.toString());
      formData.append('fecha_gasto', data.fecha_gasto);
      formData.append('metodo_pago_id', data.metodo_pago_id.toString());
      if (data.notas) formData.append('notas', data.notas);
      formData.append('comprobante', data.comprobante);
      body = formData;
    } else {
      // Sin archivo, usar JSON
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        concepto: data.concepto,
        monto: data.monto,
        fecha_gasto: data.fecha_gasto,
        metodo_pago_id: data.metodo_pago_id,
        notas: data.notas,
      });
    }

    const response = await authService.authenticatedFetch('/api/gastos', {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear gasto');
    }

    return response.json();
  },

  /**
   * Obtiene estadísticas de gastos
   */
  async obtenerEstadisticasGastos(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<EstadisticasGastos> {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append('fecha_fin', params.fecha_fin);

    const response = await authService.authenticatedFetch(
      `/api/gastos/estadisticas?${searchParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener estadísticas');
    }

    return response.json();
  },

  // ==================== INGRESOS ====================

  /**
   * Lista todos los ingresos con filtros
   */
  async listarIngresos(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    servicio_id?: number;
    metodo_pago_id?: number;
    limite?: number;
    offset?: number;
  }): Promise<{ ingresos: Ingreso[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append('fecha_fin', params.fecha_fin);
    if (params?.servicio_id) searchParams.append('servicio_id', params.servicio_id.toString());
    if (params?.metodo_pago_id) searchParams.append('metodo_pago_id', params.metodo_pago_id.toString());
    if (params?.limite) searchParams.append('limite', params.limite.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await authService.authenticatedFetch(
      `/api/ingresos?${searchParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener ingresos');
    }

    return response.json();
  },

  /**
   * Crea un nuevo ingreso
   */
  async crearIngreso(data: {
    servicio_id?: number;
    concepto?: string;
    monto: number;
    fecha_ingreso: string;
    metodo_pago_id: number;
    notas?: string;
    comprobante?: File;
  }): Promise<{ mensaje: string; ingreso: Ingreso }> {
    let body: FormData | string;
    let headers: Record<string, string> = {};

    if (data.comprobante) {
      // Con archivo, usar FormData
      const formData = new FormData();
      if (data.servicio_id) formData.append('servicio_id', data.servicio_id.toString());
      if (data.concepto) formData.append('concepto', data.concepto);
      formData.append('monto', data.monto.toString());
      formData.append('fecha_ingreso', data.fecha_ingreso);
      formData.append('metodo_pago_id', data.metodo_pago_id.toString());
      if (data.notas) formData.append('notas', data.notas);
      formData.append('comprobante', data.comprobante);
      body = formData;
    } else {
      // Sin archivo, usar JSON
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        servicio_id: data.servicio_id,
        concepto: data.concepto,
        monto: data.monto,
        fecha_ingreso: data.fecha_ingreso,
        metodo_pago_id: data.metodo_pago_id,
        notas: data.notas,
      });
    }

    const response = await authService.authenticatedFetch('/api/ingresos', {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear ingreso');
    }

    return response.json();
  },

  /**
   * Obtiene estadísticas de ingresos
   */
  async obtenerEstadisticasIngresos(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<EstadisticasIngresos> {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append('fecha_fin', params.fecha_fin);

    const response = await authService.authenticatedFetch(
      `/api/ingresos/estadisticas?${searchParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener estadísticas');
    }

    return response.json();
  },

  // ==================== CATÁLOGOS ====================

  /**
   * Obtiene todos los métodos de pago
   */
  async obtenerMetodosPago(): Promise<MetodoPago[]> {
    const response = await authService.authenticatedFetch('/api/metodos-pago');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener métodos de pago');
    }

    const data = await response.json();
    return data.metodos_pago || data;
  },

  /**
   * Obtiene todos los servicios (para ingresos)
   */
  async obtenerServicios(): Promise<Servicio[]> {
    const response = await authService.authenticatedFetch('/api/servicios');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener servicios');
    }

    const data = await response.json();
    return data.servicios || data;
  },
};
