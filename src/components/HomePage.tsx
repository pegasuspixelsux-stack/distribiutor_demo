'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { HomeProperty } from '@/src/lib/homeData';
import { typeLabels } from '@/src/utils/format';
import SiteFooter from '@/src/components/SiteFooter';
import InfoSections from '@/src/components/InfoSections';
import SimilarItems from '@/src/components/SimilarItems';
import InstallButton from '@/src/components/InstallButton';
import SearchModal from '@/src/components/SearchModal';
import { toBestSellers } from '@/src/utils/bestSellers';
import CartButton from '@/src/components/CartButton';
import { OPEN_CLIENT_LOGIN } from '@/src/components/SignInNotice';
import WholesaleAccess from '@/src/components/WholesaleAccess';
import CatalogPage from '@/src/components/CatalogPage';
import SiteNavLinks from '@/src/components/SiteNavLinks';
import MobileNavMenu from '@/src/components/MobileNavMenu';
import { useClient } from '@/src/context/ClientContext';
import { applyBoxFirst, applyLevel } from '@/src/utils/pricing';
import {
  ArrowUpRight,
  KeyRound,
  Search,
} from 'lucide-react';
import { useBusiness } from '@/src/context/BusinessContext';
import { brandOf } from '@/src/lib/siteMeta';





/** Hero heading / subheading styles: on phones both are as wide as the buttons (max-w-sm). */
const HERO_HEADING_CLASS =
  'mt-4 max-md:mt-0 max-w-6xl max-md:text-center max-md:w-full max-md:max-w-sm max-md:text-[clamp(18px,calc((100vw-40px)/10.5),36px)] max-md:leading-[1.1] sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.1]';
const HERO_TEXT_CLASS =
  'mt-4 max-md:mt-1.5 md:mt-3 max-w-2xl max-md:w-full max-md:max-w-sm max-md:text-center text-[17px] max-md:text-[15px] max-md:leading-[1.35] max-md:tracking-[-0.022em] md:text-base text-white/95 font-normal leading-relaxed';

/** Hero buttons: dark-to-light green vertical gradient (primary) and a white outline (secondary), both with hover and press effects. */
const HERO_BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 max-md:min-h-11 text-sm max-md:text-base max-md:tracking-[-0.022em] font-semibold transition-all duration-300 ease-out active:translate-y-0 active:scale-95';
const HERO_BTN_PRIMARY =
  `${HERO_BTN_BASE} group text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] bg-gradient-to-b from-[#14532D] to-[#43A047] shadow-md shadow-black/25 ring-1 ring-white/30 hover:ring-white/70 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-300/40 active:brightness-90`;
const HERO_BTN_SECONDARY =
  `${HERO_BTN_BASE} border-2 border-white bg-transparent text-white shadow-md shadow-black/25 hover:bg-white hover:text-[#14532D] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/30 active:bg-white/90`;

export default function HomePage({
  initialProperties = [],
}: {
  /** Active products loaded on the server from the database. */
  initialProperties?: HomeProperty[];
}) {
  const [baseProperties] = useState<HomeProperty[]>(initialProperties);
  // A customer who logged in with Acceso mayoristas sees their price level; everyone else sees list prices.
  const { client, level, signOutClient } = useClient();
  const business = useBusiness();
  const router = useRouter();
  // Phone top nav: transparent over the hero, blurred and tinted once the page scrolls.
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const allowLoose = client?.allowLoose ?? false;
  const properties = useMemo(() => applyBoxFirst(applyLevel(baseProperties, level), level, allowLoose), [baseProperties, level, allowLoose]);
  const [query, setQuery] = useState('');
  // Pills: one per category that has items, in the order they first appear.
  const categories = Array.from(
    new Map(
      properties
        .filter((p) => p.type)
        .map((p) => [p.type as string, p.typeLabel ?? typeLabels[p.type as string] ?? (p.type as string)]),
    ),
    ([id, label]) => ({ id, label }),
  );

  // "Más vendidos": the items marked destacado in the dashboard (or the first ones).
  const bestSellers = useMemo(() => toBestSellers(properties), [properties]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] max-md:bg-[var(--brand-bg,#2E7D32)] text-[#1D1D1F] selection:bg-[#000000] selection:text-[#FFFFFF] font-sans antialiased">

      {/* --- PHONE TOP NAV: burger on the left; search and "add to home screen" on the right --- */}
      <header
        className={`md:hidden fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-[background-color] duration-300 ${
          scrolled ? 'bg-[color-mix(in_srgb,var(--brand-bg,#2E7D32)_72%,transparent)]' : 'bg-transparent'
        }`}
      >
        <div className="bg-[#2E7D32] text-white text-center text-[11px] font-medium tracking-wide py-1.5 px-4 leading-snug pt-[calc(0.375rem+env(safe-area-inset-top))]">
          <span>Entregas diarias en Maldonado y Punta del Este</span>
        </div>
        <div className="h-14 px-3 flex items-center justify-between">
          <span className="pl-1 min-w-0 truncate font-semibold text-lg tracking-tight text-white drop-shadow">{brandOf(business)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Búsqueda avanzada"
              title="Búsqueda avanzada"
              className="w-10 h-10 shrink-0 flex items-center justify-center text-white drop-shadow hover:opacity-80 active:scale-90 transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <InstallButton className="w-10 h-10 shrink-0 flex items-center justify-center text-white drop-shadow hover:opacity-80 active:scale-90 transition" />
            <MobileNavMenu bare align="right" />
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={closeSearch} categories={categories} initialQuery={query} />

      <div className="relative max-w-[1440px] mx-auto px-0 md:max-w-none md:px-0 pt-0">
      {/* --- NAVIGATION --- */}
      <header className="hidden md:block absolute inset-x-0 top-0 z-50 text-white [&_nav]:!text-white [&_nav_a:hover]:!text-white/80">
        <div className="bg-[#2E7D32] text-white text-center text-[11px] sm:text-xs font-medium tracking-wide py-1.5 px-4 sm:px-6 leading-snug">
          <span>Entregas diarias en Maldonado y Punta del Este</span>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <span className="min-w-0 truncate max-w-md font-semibold text-xl sm:text-2xl tracking-tight text-white">{brandOf(business)}</span>
          <SiteNavLinks />
          <div className="flex items-center gap-1">
          <WholesaleAccess />
          <CartButton />
          <MobileNavMenu />
          </div>
        </div>
      </header>
        <section data-home-hero className="relative w-full max-md:h-[calc(65svh-clamp(8px,1.5svh,16px)+5.25rem+env(safe-area-inset-top))] max-md:flex max-md:flex-col max-md:justify-center max-md:pt-[calc(5.25rem+env(safe-area-inset-top))] max-md:rounded-none overflow-hidden md:rounded-none border-0 border-[var(--brand-bg,#2E7D32)] bg-[var(--brand-bg,#2E7D32)] text-white md:flex md:items-center md:h-[80svh] md:min-h-[480px] md:pt-12 md:pb-24">
          {/* Background photo + green overlay: phones get one flat, fully opaque green layer; wider screens get a gradient, solid on the left (behind the text) and more transparent to the right */}
          {business.heroImage && (
            <>
              <div aria-hidden="true" className="absolute inset-0 bg-cover bg-[position:50%_75%] hidden md:block" style={{ backgroundImage: `url(${JSON.stringify(business.heroImage)})` }} />
              <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: `url(${JSON.stringify(business.heroImage)})` }} />
            </>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-transparent bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.4)_40%,transparent_75%)]"
          />
            <div className="relative w-full max-md:shrink-0 px-5 md:px-[max(2.5rem,calc((100%-1440px)/2+4rem))] max-md:pt-0 pt-[clamp(16px,4svh,32px)] max-md:pb-[max(12px,env(safe-area-inset-bottom))] pb-[max(clamp(16px,4svh,32px),env(safe-area-inset-bottom))] flex flex-col items-center text-center md:pt-9 md:pb-9 md:landscape:max-xl:pt-7 md:landscape:max-xl:pb-7 md:portrait:pt-7 md:portrait:pb-7">
            {business.heroEyebrow && (
              <span className="max-md:hidden block w-fit max-md:mt-0 md:inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
                {business.heroEyebrow}
              </span>
            )}
            {business.heroHeading && (
              <h1 className={`${HERO_HEADING_CLASS} whitespace-pre-line`}>{business.heroHeading}</h1>
            )}
            {business.heroText && (
              <p className={`${HERO_TEXT_CLASS} whitespace-pre-line`}>{business.heroText}</p>
            )}
            <div className="mt-[clamp(16px,4svh,32px)] max-md:mt-3 md:mt-6 flex flex-col sm:flex-row gap-3 max-md:gap-2 md:gap-2.5 max-md:w-full max-md:max-w-sm">
              {client && level ? (
                <div className="flex flex-col sm:flex-row gap-3 md:gap-2.5 max-md:w-full">
                  <Link
                    href="/productos"
                    className={HERO_BTN_PRIMARY}
                  >
                    <span className="truncate max-w-56">Catálogo · {client.businessName}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={signOutClient}
                    className={HERO_BTN_SECONDARY}
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
              <Link
                href="/productos"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent(OPEN_CLIENT_LOGIN, { detail: { redirect: '/productos' } }));
                }}
                className={HERO_BTN_PRIMARY}
              >
                <span>Acceso al Catálogo Mayorista</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              )}
              {!(client && level) && (
              <a
                href="#contact"
                className={HERO_BTN_SECONDARY}
              >
                <KeyRound className="w-4 h-4" />
                <span>Solicitar acceso mayorista</span>
              </a>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* --- Catalog grid (same as /productos), right under the hero --- */}
      <CatalogPage
        items={baseProperties}
        embedded
        gridTitle="Nuestros Productos"
        afterGrid={<SimilarItems title="Más vendidos" items={bestSellers} embedded />}
        leading={(
        <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              router.push(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
            }}
            className="w-full mb-0 bg-white rounded-2xl shadow-lg border border-[#000000]/5 p-3 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 pl-3">
              <Search className="hidden md:block w-5 h-5 text-[#515154] shrink-0" />
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá por nombre, categoría o precio…"
                aria-label="Buscar productos por nombre, categoría o precio"
                className="min-w-0 flex-1 bg-transparent px-2 md:px-4 py-3 text-base md:text-sm text-[#1D1D1F] placeholder:text-[#86868B] outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="shrink-0 bg-[#2E7D32] text-white text-xs font-medium w-11 h-11 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full hover:bg-[#2E7D32]/85 transition-all flex items-center justify-center"
              >
                <Search className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">Buscar</span>
              </button>
            </div>
          </form>
        )}
      />

      {/* --- BODY: search, category pills and the "Más vendidos" slider. The full catalog (12 per page) lives at /productos --- */}

      <InfoSections />

      <SiteFooter />

    </div>
  );
}
