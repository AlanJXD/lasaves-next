"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, PhotoIcon, CheckIcon } from '@heroicons/react/24/solid';
import { MetodoPago, Servicio, finanzasService } from '@/lib/finanzas';

interface ModalMovimientoProps {
  isOpen: boolean;
  onClose: () => void;
  metodosPago: MetodoPago[];
  onSubmit: (data: FormData, tipo: 'ingreso' | 'gasto') => Promise<void>;
  modoEdicion?: boolean;
  datosIniciales?: {
    tipo: 'ingreso' | 'gasto';
    id: number;
    monto: string;
    concepto: string;
    metodo_pago_id: number;
    servicio_id?: number;
    notas?: string;
    comprobante_url?: string;
  };
}

export default function ModalMovimiento({
  isOpen,
  onClose,
  metodosPago,
  onSubmit,
  modoEdicion = false,
  datosIniciales,
}: ModalMovimientoProps) {
  const [tipoActivo, setTipoActivo] = useState<'ingreso' | 'gasto'>('gasto');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [notas, setNotas] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar servicios al montar
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const serviciosData = await finanzasService.obtenerServicios();
        setServicios(serviciosData);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
      }
    };
    cargarServicios();
  }, []);

  // Resetear o cargar datos cuando se abre
  useEffect(() => {
    if (isOpen) {
      if (modoEdicion && datosIniciales) {
        // Cargar datos para edición
        setTipoActivo(datosIniciales.tipo);
        setMonto(datosIniciales.monto);
        setConcepto(datosIniciales.concepto);
        setMetodoPagoId(datosIniciales.metodo_pago_id.toString());
        setServicioId(datosIniciales.servicio_id?.toString() || '');
        setMostrarNotas(!!datosIniciales.notas);
        setNotas(datosIniciales.notas || '');
        setImagenes([]);
        setError('');
      } else {
        // Resetear para nuevo movimiento
        setTipoActivo('gasto');
        setMonto('');
        setConcepto('');
        setMetodoPagoId('');
        setServicioId('');
        setMostrarNotas(false);
        setNotas('');
        setImagenes([]);
        setError('');
      }
    }
  }, [isOpen, modoEdicion, datosIniciales]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return (isImage || isPDF) && isValidSize;
    });

    setImagenes(prev => [...prev, ...validFiles]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleServicioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const servicioIdSeleccionado = e.target.value;
    setServicioId(servicioIdSeleccionado);

    // Si se seleccionó un servicio, autocompletar el monto con el costo_referencia
    if (servicioIdSeleccionado) {
      const servicio = servicios.find(s => s.id_servicio.toString() === servicioIdSeleccionado);
      if (servicio) {
        setMonto(parseFloat(servicio.costo_referencia).toFixed(2));
      }
    }
  }, [servicios]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!monto || parseFloat(monto) <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      if (!concepto.trim()) {
        throw new Error('El concepto es requerido');
      }
      if (!metodoPagoId) {
        throw new Error('Seleccione un método de pago');
      }

      const formData = new FormData();
      formData.append('monto', parseFloat(monto).toFixed(2));
      formData.append('concepto', concepto.trim());
      formData.append('metodo_pago_id', metodoPagoId);

      // Si es ingreso y se seleccionó un servicio, incluirlo
      if (tipoActivo === 'ingreso' && servicioId) {
        formData.append('servicio_id', servicioId);
      }

      if (mostrarNotas && notas.trim()) {
        formData.append('notas', notas.trim());
      }

      if (imagenes.length > 0) {
        console.log('📎 Agregando comprobante:', imagenes[0].name, imagenes[0].type, imagenes[0].size, 'bytes');
        formData.append('comprobante', imagenes[0]);
      } else {
        console.log('ℹ️ No hay comprobante para agregar');
      }

      await onSubmit(formData, tipoActivo);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  }, [monto, concepto, metodoPagoId, servicioId, mostrarNotas, notas, imagenes, tipoActivo, onSubmit, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-screen flex-col rounded-t-3xl bg-white shadow-2xl"
            style={{
              maxHeight: '90vh',
            }}
          >
            {/* Header con Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  {modoEdicion ? 'Editar Movimiento' : 'Agregar Movimiento'}
                </h2>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="grid size-8 place-items-center rounded-full bg-[color:var(--input)] text-[color:var(--text)] transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              {!modoEdicion && (
                <div className="flex gap-1 px-5 pb-2">
                  <button
                    type="button"
                    onClick={() => setTipoActivo('gasto')}
                    disabled={isSubmitting}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      tipoActivo === 'gasto'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoActivo('ingreso')}
                    disabled={isSubmitting}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      tipoActivo === 'ingreso'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    Ingreso
                  </button>
                </div>
              )}
              {modoEdicion && (
                <div className="px-5 pb-2">
                  <div className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    tipoActivo === 'ingreso' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {tipoActivo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </div>
                </div>
              )}
            </div>

            {/* Content - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Servicio (solo para ingresos) */}
                {tipoActivo === 'ingreso' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                      Servicio (opcional)
                    </label>
                    <select
                      value={servicioId}
                      onChange={handleServicioChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--brand)]"
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.id_servicio} value={servicio.id_servicio}>
                          {servicio.nombre} - ${parseFloat(servicio.costo_referencia).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Monto */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                    Monto
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text)]">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-8 pr-4 text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--brand)]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Concepto */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    placeholder="Descripción del movimiento"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--brand)]"
                    required
                    minLength={3}
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                    Método de Pago
                  </label>
                  <select
                    value={metodoPagoId}
                    onChange={(e) => setMetodoPagoId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--brand)]"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar método</option>
                    {metodosPago.map((metodo) => (
                      <option key={metodo.id_metodo} value={metodo.id_metodo}>
                        {metodo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comprobante */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                    Comprobante (opcional)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment');
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={isSubmitting || imagenes.length > 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <CameraIcon className="h-5 w-5" />
                      Tomar foto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.removeAttribute('capture');
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={isSubmitting || imagenes.length > 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      Galería
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isSubmitting}
                  />

                  {/* Vista previa de imágenes */}
                  {imagenes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {imagenes.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-2"
                        >
                          <span className="text-sm text-[color:var(--text)] truncate flex-1">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkbox Notas */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMostrarNotas(!mostrarNotas)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 text-sm font-medium text-[color:var(--text)]"
                  >
                    <div
                      className={`grid size-5 place-items-center rounded border-2 transition-colors ${
                        mostrarNotas
                          ? 'border-[color:var(--brand)] bg-[color:var(--brand)]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {mostrarNotas && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    Agregar nota
                  </button>
                </div>

                {/* Notas */}
                {mostrarNotas && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                      Notas
                    </label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Información adicional..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--brand)] resize-none"
                      maxLength={5000}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              {/* Footer - Fijo */}
              <div className="border-t border-gray-200 px-5 py-4" style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
              }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full px-5 py-3 text-center font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {isSubmitting ? (modoEdicion ? 'Actualizando...' : 'Guardando...') : (modoEdicion ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
