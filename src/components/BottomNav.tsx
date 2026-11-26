'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, House, LayoutGrid, ShoppingCart } from 'lucide-react';
import { useCart } from '@/src/context/CartContext';

/**
 * Bottom navigation for phones: Inicio, Catálogo, Favoritos and Carrito, on every page (the CSS in globals.css shows it
 * below 768px only: `.app-bottom-nav`). It also covers the installed app (home-screen icon), which has no browser toolbar.
 * A floating rounded bar of white icons on blurred brand green; the current page's icon is full white and bolder, the others dimmed.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();

  const tab = (active: boolean) =>
    `relative flex flex-1 items-center justify-center min-h-11 rounded-full transition-colors duration-200 active:scale-90 ${
      active ? 'text-white' : 'text-white/70 hover:text-white'
    }`;
  const icon = (active: boolean) => `w-6 h-6 transition-transform duration-200 ${active ? 'scale-110 [stroke-width:2.4]' : ''}`;

  // The /distribuidores promo is a single full screen shared on WhatsApp: no app navigation on top of it.
  if (pathname.startsWith('/distribuidores')) return null;

  const home = pathname === '/';
  const catalog = pathname.startsWith('/productos');
  const favorites = pathname.startsWith('/favoritos');

  return (
    <nav
      aria-label="Navegación de la app"
      className="app-bottom-nav fixed inset-x-3 bottom-[max(0.25rem,calc(env(safe-area-inset-bottom)-0.75rem))] z-40 gap-1 rounded-full border border-white/20 bg-[color-mix(in_srgb,var(--brand-bg,#2E7D32)_72%,transparent)] backdrop-blur-3xl backdrop-saturate-150 p-1.5 shadow-xl shadow-black/15"
    >
      <Link href="/" aria-label="Inicio" title="Inicio" className={tab(home)} aria-current={home ? 'page' : undefined}>
        <House className={icon(home)} aria-hidden="true" />
      </Link>
      <Link href="/productos" aria-label="Catálogo" title="Catálogo" className={tab(catalog)} aria-current={catalog ? 'page' : undefined}>
        <LayoutGrid className={icon(catalog)} aria-hidden="true" />
      </Link>
      <Link href="/favoritos" aria-label="Favoritos" title="Favoritos" className={tab(favorites)} aria-current={favorites ? 'page' : undefined}>
        <Heart className={icon(favorites)} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
        title="Carrito"
        className={tab(false)}
      >
        <span className="relative">
          <ShoppingCart className={icon(false)} aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-white text-[var(--brand-bg,#2E7D32)] text-[10px] font-semibold flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
      </button>
    </nav>
  );
}
