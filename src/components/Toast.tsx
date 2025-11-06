"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  mensaje: string;
  visible: boolean;
  onClose: () => void;
  duracion?: number;
}

export default function Toast({ mensaje, visible, onClose, duracion = 3000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duracion);

      return () => clearTimeout(timer);
    }
  }, [visible, duracion, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed left-1/2 z-[100] w-[90vw] max-w-md -translate-x-1/2"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-green-500" />
            <span className="text-sm font-medium text-[color:var(--text)]">
              {mensaje}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
