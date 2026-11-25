'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, SquarePlus, X } from 'lucide-react';

// The browser event that lets a page offer "install this app" (Chrome and Edge on Android / desktop).
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * "Add to home screen" button. Android / Chrome opens the browser's install prompt; iPhone and iPad (no install
 * prompt in Safari) get a short how-to. Hidden once the site is already installed.
 */
export default function InstallButton({ className = '' }: { className?: string }) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the browser
    if (standalone) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep the event so the button can show the prompt later
      setPromptEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // A tiny service worker is what lets Chrome offer the install prompt.
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!help) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setHelp(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [help]);

  if (installed) return null;

  const click = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => null);
      setPromptEvent(null); // an install prompt can be shown only once
      return;
    }
    setHelp(true); // Safari and others: explain how to add it by hand
  };

  return (
    <>
      <button type="button" onClick={click} aria-label="Agregar a la pantalla de inicio" title="Agregar a la pantalla de inicio" className={className}>
        <Download className="w-5 h-5" />
      </button>
      {help &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
            <div className="absolute inset-0 bg-black/40" onClick={() => setHelp(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-label="Agregar a la pantalla de inicio" className="relative w-full max-w-sm bg-white text-[#1D1D1F] rounded-2xl shadow-xl p-6">
              <button type="button" onClick={() => setHelp(false)} aria-label="Cerrar" className="absolute top-3 right-3 p-2 rounded-full hover:bg-[#F5F5F7]">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold tracking-tight">Agregar el catálogo a tu pantalla de inicio</h2>
              <ol className="mt-4 space-y-3 text-sm text-[#515154]">
                <li className="flex items-start gap-3">
                  <Share className="w-5 h-5 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                  <span>Tocá el botón <strong className="font-medium text-[#1D1D1F]">Compartir</strong> del navegador.</span>
                </li>
                <li className="flex items-start gap-3">
                  <SquarePlus className="w-5 h-5 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                  <span>Elegí <strong className="font-medium text-[#1D1D1F]">Agregar a pantalla de inicio</strong> y confirmá.</span>
                </li>
              </ol>
              <button type="button" onClick={() => setHelp(false)} className="mt-6 w-full rounded-full bg-[#1D1D1F] text-white py-3 text-sm font-medium hover:bg-[#333336] transition-colors">
                Entendido
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
