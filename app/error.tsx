'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

/** Shown instead of a page that crashed (for example a failed database call), with a way to retry or go back. */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="text-sm text-[#515154]">
          No pudimos cargar esta página. Revisá tu conexión e intentá de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="min-h-11 px-6 rounded-full bg-[#1D1D1F] text-white text-sm font-medium hover:bg-[#333336] transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/productos"
            className="min-h-11 px-6 inline-flex items-center justify-center rounded-full border border-[#000000]/10 text-sm font-medium hover:bg-[#F5F5F7] transition-colors"
          >
            Ver el catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
