// src/lib/reportes.ts

// Configuración de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface GenerarReportePayload {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface GenerarReporteResponse {
  mensaje: string;
  archivo: string;
  ruta: string;
  periodo: string;
}

class ReportesService {
  async generarReporteFinanciero(payload: GenerarReportePayload): Promise<Blob> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/api/reportes/financiero`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error al generar reporte: ${response.status}`);
    }

    // Retornar el PDF como blob
    return await response.blob();
  }
}

export const reportesService = new ReportesService();
