"use client";

import { PropsWithChildren } from "react";

export default function TransitionLayout({ children }: PropsWithChildren) {
  // Solo envuelve el contenido, sin animaciones ni lógica extra.
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {children}
    </div>
  );
}
