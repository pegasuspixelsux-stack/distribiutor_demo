'use client';

import { Fragment, type ReactNode, useEffect, useMemo, useState } from 'react';
import { groupByCategory } from '@/src/utils/group';
import Link from 'next/link';
import { Heart, LayoutGrid, List, LogOut, Plus, Search, SlidersHorizontal, Square, X } from 'lucide-react';
import type { HomeProperty } from '@/src/lib/homeData';
import { typeLabels } from '@/src/utils/format';
import PropertyImage from '@/src/components/PropertyImage';
import CartButton from '@/src/components/CartButton';
import { unitPriceOf } from '@/src/components/CartDrawer';
import { useCart } from '@/src/context/CartContext';
import SiteFooter from '@/src/components/SiteFooter';
import WholesaleAccess from '@/src/components/WholesaleAccess';
import FavoriteButton from '@/src/components/FavoriteButton';
import SiteNavLinks from '@/src/components/SiteNavLinks';
import MobileNavMenu from '@/src/components/MobileNavMenu';
import { useClient } from '@/src/context/ClientContext';
import { applyBoxFirst, applyLevel } from '@/src/utils/pricing';
import InfoSections from '@/src/components/InfoSections';
import BrandName from '@/src/components/BrandName';

const PAGE_SIZE = 12; // default products per page
const PAGE_SIZES = [12, 24, 36, 48, 60];

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'name';
type Availability = 'all' | 'in-stock' | 'on-sale';

const sortLabels: Record<Sort, string> = {
  relevance: 'Más recientes',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  name: 'Nombre: A–Z',
};

const availabilityLabels: Record<Availability, string> = {
  all: 'Todos',
  'in-stock': 'Solo en stock',
  'on-sale': 'En oferta',
};

const fieldClass =
  'w-full bg-[#FBFBFD] border border-[#000000]/10 rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] transition-colors';
const labelClass = 'block text-[10px] uppercase tracking-wider font-semibold text-[#515154] mb-1.5';

/** Greeting for the hour of the day on the visitor's device. */
const greeting = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 12 ? 'Buenos días' : h >= 12 && h < 20 ? 'Buenas tardes' : 'Buenas noches';
};

/** Page buttons: 1 … 4 5 6 … 9 (null = gap). */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}

export default function CatalogPage({ items: baseItems, embedded = false, leading, afterGrid, gridTitle }: { items: HomeProperty[]; embedded?: boolean; leading?: ReactNode; afterGrid?: ReactNode; gridTitle?: string }) {
  // A customer who opened their access link sees their price level; everyone else sees list prices.
  const { client, level, signOutClient, favorites } = useClient();
  const allowLoose = client?.allowLoose ?? false;
  const items = useMemo(() => applyBoxFirst(applyLevel(baseItems, level), level, allowLoose), [baseItems, level, allowLoose]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState<Availability>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<Sort>('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
const [filtersOpen, setFiltersOpen] = useState(false); // mobile only

  // Links from the homepage and footer open the catalog already filtered: /productos?category=<id>&q=<search>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('category');
    const q = params.get('q');
    const av = params.get('availability');
    const mn = params.get('min');
    const mx = params.get('max');
    const so = params.get('sort');
    /* eslint-disable react-hooks/set-state-in-effect -- initial filters from the URL */
    if (c) setCategory(c);
    if (q) setQuery(q);
    if (av === 'in-stock' || av === 'on-sale') setAvailability(av);
    if (mn && Number.isFinite(Number(mn))) setMinPrice(mn);
    if (mx && Number.isFinite(Number(mx))) setMaxPrice(mx);
    if (so === 'price-asc' || so === 'price-desc' || so === 'name') setSort(so);
    if (av || mn || mx || so) setFiltersOpen(true); // show the advanced filters that were applied
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
// The top nav is transparent at the top of the page and gets a blurred background once you scroll.
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

  // Cart: shared with every page (see CartContext).
  const { add: addToCart } = useCart();

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          items
            .filter((p) => p.type)
            .map((p) => [p.type as string, p.typeLabel ?? typeLabels[p.type as string] ?? (p.type as string)]),
        ),
        ([id, label]) => ({ id, label }),
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    const list = items.filter((p) => {
      if (q) {
        const haystack = [p.title, p.typeLabel ?? typeLabels[p.type as string] ?? p.type, p.price, p.salePrice]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (category !== 'all' && p.type !== category) return false;
      if (availability === 'in-stock' && p.inStock === false) return false;
      if (availability === 'on-sale' && !(p.salePrice && p.inStock !== false)) return false;
      const price = unitPriceOf(p);
      if (min !== null && Number.isFinite(min) && price < min) return false;
      if (max !== null && Number.isFinite(max) && price > max) return false;
      return true;
    });
    if (sort === 'price-asc') list.sort((a, b) => unitPriceOf(a) - unitPriceOf(b));
    else if (sort === 'price-desc') list.sort((a, b) => unitPriceOf(b) - unitPriceOf(a));
    else if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    return list;
  }, [items, query, category, availability, minPrice, maxPrice, sort]);

const activeFilters =
    (query.trim() ? 1 : 0) +
    (category !== 'all' ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0);

  const reset = () => {
    setQuery('');
    setCategory('all');
    setAvailability('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('relevance');
    setPage(1);
  };

  // A filter change goes back to page 1; the page never exceeds the last one.
  // Phones only: one big card per row, two per row (default) or a compact list; remembered with the homepage's choice.
  const [layout, setLayout] = useState<'one' | 'two' | 'list'>('two');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('merkado-grid-layout');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the visitor's choice
      if (saved === 'one' || saved === 'two' || saved === 'list') setLayout(saved);
      // First visit on a phone: the catalog opens as a list.
      else if (window.matchMedia('(max-width: 767px)').matches) setLayout('list');
    } catch {
      /* private mode: the choice just is not remembered */
    }
  }, []);
  const chooseLayout = (v: 'one' | 'two' | 'list') => {
    setLayout(v);
    try {
      localStorage.setItem('merkado-grid-layout', v);
    } catch {
      /* ignore */
    }
  };

  const change =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  // products per page (selectable on the homepage); a filter change goes back to page 1.
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const grouped = groupByCategory(filtered);
  const visible = grouped.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const goToPage = (n: number) => {
    setPage(n);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const soft = embedded ? 'bg-[#F5F5F7]' : 'bg-white'; // controls sit on a white section when embedded
  return (
    <div className={`${embedded ? 'bg-white rounded-t-3xl -mt-6 relative z-10' : 'min-h-screen bg-[#FBFBFD] max-md:bg-[var(--brand-bg,#2E7D32)]'} text-[#1D1D1F] selection:bg-[#000000] selection:text-[#FFFFFF] font-sans antialiased`}>
      {/* --- NAVIGATION --- */}
      {!embedded && <header className={`sticky top-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${scrolled ? 'max-md:bg-[color-mix(in_srgb,var(--brand-bg,#2E7D32)_80%,transparent)] md:bg-[#FBFBFD]/80 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="bg-[#2E7D32] text-white text-center text-[11px] sm:text-xs font-medium tracking-wide py-1.5 px-4 sm:px-6 leading-snug">
          <span>Entregas diarias en Maldonado y Punta del Este</span>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-sm min-[420px]:text-base sm:text-lg tracking-tight"><BrandName onDark /></Link>
          <SiteNavLinks />
          <div className="flex items-center gap-1">
          <WholesaleAccess glass />
          <CartButton glass />
          <MobileNavMenu glass />
          </div>
        </div>
      </header>}

      {/* --- ALL PRODUCTS: 4-column grid --- */}
      <section id="catalog" className={`pt-4 md:pt-6 pb-12 px-3 md:px-6 max-w-[1440px] mx-auto scroll-mt-32 ${embedded ? '' : 'bg-[#ECECF1] rounded-3xl max-md:mt-3 max-md:mb-2 md:mt-4 md:w-[calc(100%-3rem)]'}`}>
        {/* Signed-in customer: greeting with their favorites and a log-out button, above the search */}
        {client && level && (
          <div className="mb-5 flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
            <p className="text-[clamp(24px,7.5vw,28px)] md:text-2xl font-semibold tracking-[-0.02em] leading-[1.15] text-[#1D1D1F] text-balance">
              {greeting()}, {(client.contactName || client.businessName).split(' ')[0]}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/favoritos"
                className={`h-9 px-4 rounded-full ${soft} text-[#1D1D1F] text-sm font-medium inline-flex items-center gap-2 hover:bg-[#F5F5F7] active:scale-95 transition`}
              >
                <Heart className="w-4 h-4" />
                Favoritos
                {favorites.length > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-[#2E7D32] text-white text-[10px] font-semibold flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={signOutClient}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className={`w-9 h-9 shrink-0 rounded-full ${soft} text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] active:scale-95 transition`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search bar (with the filters) */}
        {!embedded && <div id="search" className="mb-4">
          <form
            role="search"
            aria-label="Búsqueda avanzada"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full bg-white text-[#1D1D1F] rounded-2xl shadow-lg border border-[#000000]/5 p-3 md:p-4"
          >
            <div className="flex items-center gap-2">
              <Search className="hidden md:block ml-2 w-5 h-5 text-[#515154] shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => change(setQuery)(e.target.value)}
                placeholder="Buscá por nombre, categoría o precio…"
                aria-label="Buscar productos por nombre, categoría o precio"
                className="min-w-0 flex-1 bg-transparent px-3 md:px-2 py-3 text-sm placeholder:text-[#86868B] outline-none"
              />
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                aria-controls="advanced-filters"
                className={`md:hidden shrink-0 relative w-11 h-11 rounded-full ${soft} flex items-center justify-center`}
                aria-label="Mostrar filtros"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilters > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#1D1D1F] text-white text-[10px] font-semibold flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
              <button
                type="submit"
                aria-label="Buscar"
                className="shrink-0 bg-[#2E7D32] text-white text-xs font-medium w-11 h-11 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full hover:bg-[#2E7D32]/85 transition-all flex items-center justify-center"
              >
                <Search className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">Buscar</span>
              </button>
            </div>

            <div
              id="advanced-filters"
              className={`${filtersOpen ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[#000000]/5`}
            >
              <div>
                <label htmlFor="f-category" className={labelClass}>Categoría</label>
                <select
                  id="f-category"
                  value={category}
                  onChange={(e) => change(setCategory)(e.target.value)}
                  className={fieldClass}
                >
                  <option value="all">Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-availability" className={labelClass}>Disponibilidad</label>
                <select
                  id="f-availability"
                  value={availability}
                  onChange={(e) => change(setAvailability)(e.target.value as Availability)}
                  className={fieldClass}
                >
                  {(Object.keys(availabilityLabels) as Availability[]).map((a) => (
                    <option key={a} value={a}>{availabilityLabels[a]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-min" className={labelClass}>Precio mínimo (US$)</label>
                <input
                  id="f-min"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={minPrice}
                  onChange={(e) => change(setMinPrice)(e.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="f-max" className={labelClass}>Precio máximo (US$)</label>
                <input
                  id="f-max"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(e) => change(setMaxPrice)(e.target.value)}
                  placeholder="Sin límite"
                  className={fieldClass}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="f-sort" className={labelClass}>Ordenar por</label>
                <select
                  id="f-sort"
                  value={sort}
                  onChange={(e) => change(setSort)(e.target.value as Sort)}
                  className={fieldClass}
                >
                  {(Object.keys(sortLabels) as Sort[]).map((s) => (
                    <option key={s} value={s}>{sortLabels[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            {(activeFilters > 0 || sort !== 'relevance') && (
              <div className="flex justify-end mt-3 md:mt-4 px-1 text-xs">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 font-medium text-[#1D1D1F] hover:text-[#515154]"
                >
                  <X className="w-3.5 h-3.5" /> Borrar filtros
                </button>
              </div>
            )}
          </form>
        </div>}

        {/* Category buttons (and, on phones, the layout selector) */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 ${leading ? 'max-md:flex-col max-md:items-stretch md:gap-4' : ''}`}>
            {leading && <div className="md:w-1/2 md:shrink-0 md:order-2">{leading}</div>}
            {/* Phones: pills and layout selector share one row (the search bar sits above); desktop ignores this wrapper */}
            <div className="flex flex-1 min-w-0 items-center gap-2 md:contents">
            <div
              role="group"
              aria-label="Categorías"
              className={`flex flex-1 ${leading ? 'md:w-1/2 md:flex-none' : ''} min-w-0 flex-nowrap items-center gap-2 overflow-x-auto -ml-3 pl-3 md:mx-0 md:pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
            >
              {[{ id: 'all', label: 'Todas' }, ...categories].map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => change(setCategory)(c.id)}
                    aria-pressed={active}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      active ? 'bg-[#2E7D32] text-white' : `${soft} text-[#1D1D1F] hover:bg-[#F5F5F7]`
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div role="group" aria-label="Diseño de la lista" className={`md:hidden shrink-0 inline-flex rounded-full ${soft} p-0.5`}>
              {([
                ['one', Square, '1 columna'],
                ['two', LayoutGrid, '2 columnas'],
                ['list', List, 'Lista'],
              ] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseLayout(value)}
                  aria-pressed={layout === value}
                  aria-label={label}
                  title={label}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    layout === value ? 'bg-[#2E7D32] text-white' : 'text-[#515154] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            </div>
          </div>
        </div>

        {gridTitle && <h2 className="mb-6 text-2xl md:text-3xl font-semibold tracking-tight">{gridTitle}</h2>}

        <div className={`grid ${layout === 'two' ? 'grid-cols-2' : 'grid-cols-1'} md:grid-cols-3 lg:grid-cols-4 ${layout === 'list' ? 'gap-2' : 'gap-3'} md:gap-6`}>
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-[#515154] text-sm py-16">
              <p>No hay productos que coincidan con tu búsqueda.</p>
              <button type="button" onClick={reset} className="mt-3 font-medium text-[#1D1D1F] underline underline-offset-4">
                Borrar filtros
              </button>
            </div>
          )}
          {visible.map((prop, idx) => {
            const sectionLabel = (p: { type?: string | null; typeLabel?: string | null }) =>
              p.typeLabel ?? typeLabels[p.type as string] ?? p.type ?? 'Otros';
            const sectionHeading =
              !embedded && (idx === 0 || visible[idx - 1].type !== prop.type) ? (
                <h3 className="col-span-full mt-4 first:mt-0 md:mt-6 text-xl md:text-2xl font-semibold tracking-tight">{sectionLabel(prop)}</h3>
              ) : null;
                        const soldOut = prop.inStock === false;
            return (
            <Fragment key={String(prop.id)}>
            {sectionHeading}
            <div key={prop.id}>
            <div className={layout === 'list' ? 'hidden md:block' : ''}>
            <div
              className={`group relative ${layout === 'one' ? 'aspect-[4/3] md:aspect-square' : 'aspect-square'} rounded-2xl overflow-hidden bg-[#E5E5EA] flex flex-col justify-end p-3 md:p-5 transition-transform duration-500 hover:-translate-y-1`}
            >
              <div className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${prop.inStock === false ? 'opacity-50 grayscale' : ''}`}>
                <PropertyImage
                  src={prop.image}
                  alt={prop.title}
                  variant="card"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              {prop.href && (
                <Link href={prop.href} aria-label={`Ver ${prop.title}`} className="absolute inset-0 z-[5]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10 flex flex-wrap gap-1.5">
                {prop.inStock === false && (
                  <span className="bg-black/80 text-white text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 rounded-full">Sin stock</span>
                )}
              </div>

              <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10 flex items-center gap-1.5">
                {typeof prop.id === 'string' && <FavoriteButton productId={prop.id} title={prop.title} className="w-8 h-8" />}
                <button
                  type="button"
                  onClick={() => addToCart(prop)}
                  disabled={prop.inStock === false}
                  aria-label={prop.inStock === false ? `${prop.title} está sin stock` : `Agregar ${prop.title} al carrito`}
                  className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-sm hover:bg-[#256628] active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 text-white pointer-events-none">
                <h2 className={`${layout === 'one' ? 'text-2xl mb-3' : 'text-sm mb-2'} md:text-lg md:mb-3 font-semibold tracking-tight leading-tight`}>{prop.title}</h2>
                <div className={`flex flex-wrap items-end justify-between gap-x-2 ${layout === 'one' ? 'text-lg' : 'text-xs'} md:text-sm font-medium`}>
                  <span className="text-white/80 truncate">{prop.area}</span>
                  <span className="max-w-full font-semibold">
                    {prop.salePrice ? (
                      <>
                        <s className="text-white/60 font-normal mr-1.5">{prop.price}</s>
                        {prop.salePrice}
                      </>
                    ) : (
                      prop.price
                    )}
                  </span>
                </div>
              </div>
            </div>
            </div>
            {layout === 'list' && (
              <div className={`md:hidden flex items-center gap-3 overflow-hidden rounded-2xl ${soft} border border-[#000000]/5 pr-2.5`}>
                {prop.href ? (
                  <Link
                    href={prop.href}
                    aria-label={`Ver ${prop.title}`}
                    className={`relative w-32 h-32 shrink-0 overflow-hidden bg-[#E5E5EA] ${soldOut ? 'opacity-50 grayscale' : ''}`}
                  >
                    <PropertyImage src={prop.image} alt={prop.title} variant="thumb" sizes="128px" />
                  </Link>
                ) : (
                  <div className={`relative w-32 h-32 shrink-0 overflow-hidden bg-[#E5E5EA] ${soldOut ? 'opacity-50 grayscale' : ''}`}>
                    <PropertyImage src={prop.image} alt={prop.title} variant="thumb" sizes="128px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight line-clamp-2">{prop.href ? <Link href={prop.href}>{prop.title}</Link> : prop.title}</p>
                  <p className="text-xs text-[#515154] mt-0.5 truncate">{prop.area}</p>
                  <p className="text-base font-semibold mt-1">
                    {soldOut ? (
                      <span className="text-xs font-semibold text-[#515154]">Sin stock</span>
                    ) : prop.salePrice ? (
                      <>
                        <s className="text-[#86868B] font-normal mr-1.5">{prop.price}</s>
                        {prop.salePrice}
                      </>
                    ) : (
                      prop.price
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {typeof prop.id === 'string' && (
                    <FavoriteButton productId={prop.id} title={prop.title} className="w-8 h-8 border border-[#000000]/5" />
                  )}
                  <button
                    type="button"
                    onClick={() => addToCart(prop)}
                    disabled={soldOut}
                    aria-label={soldOut ? `${prop.title} está sin stock` : `Agregar ${prop.title} al carrito`}
                    className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center hover:bg-[#256628] active:scale-95 transition disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            </div>
            </Fragment>
            );
          })}
        </div>

        {embedded && filtered.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#515154]">
            <label htmlFor="page-size">Mostrar</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 rounded-full bg-[#F5F5F7] px-4 text-sm font-medium text-[#1D1D1F] outline-none"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} productos</option>
              ))}
            </select>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Páginas del catálogo" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`h-11 px-4 rounded-full ${soft} text-sm font-medium hover:bg-[#F5F5F7] disabled:opacity-40 transition-colors`}
            >
              ← Anterior
            </button>
            {pageNumbers(currentPage, totalPages).map((n, i) =>
              n === null ? (
                <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-[#86868B]">…</span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-label={`Página ${n}`}
                  aria-current={n === currentPage ? 'page' : undefined}
                  className={`h-11 min-w-11 px-3 rounded-full text-sm font-medium transition-colors ${
                    n === currentPage ? 'bg-[#2E7D32] text-white' : `${soft} hover:bg-[#F5F5F7]`
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`h-11 px-4 rounded-full ${soft} text-sm font-medium hover:bg-[#F5F5F7] disabled:opacity-40 transition-colors`}
            >
              Siguiente →
            </button>
          </nav>
        )}

        {afterGrid && <div className="mt-10">{afterGrid}</div>}

        {!embedded && filtered.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-sm">
            <Link href="/" className="justify-self-center md:justify-self-start font-medium text-[#1D1D1F] hover:text-[#515154] transition-colors">
              ← Volver al inicio
            </Link>
            <p className="justify-self-center md:justify-self-end text-xs text-[#515154]">
              Página {currentPage} de {totalPages} · {filtered.length} productos
            </p>
          </div>
        )}
      </section>

      {!embedded && <InfoSections />}

      {!embedded && <SiteFooter />}
    </div>
  );
}
