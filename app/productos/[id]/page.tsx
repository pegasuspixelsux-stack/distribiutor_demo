import { cache } from 'react';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveProperties, getCategories, getProperty } from '@/src/services/dbService';
import { sampleProperties } from '@/src/data/sampleProperties';
import type { Property } from '@/src/types/firestore';
import { formatMoney, formatQuantity, mergeCategories, withUnitSuffix } from '@/src/utils/format';
import BuyBox from '@/src/components/BuyBox';
import ItemPriceView from '@/src/components/ItemPriceView';
import WholesaleAccess from '@/src/components/WholesaleAccess';
import FavoriteButton from '@/src/components/FavoriteButton';
import SiteNavLinks from '@/src/components/SiteNavLinks';
import CartButton from '@/src/components/CartButton';
import MobileNavMenu from '@/src/components/MobileNavMenu';
import SimilarItems, { type SimilarItem } from '@/src/components/SimilarItems';
import PropertyImage from '@/src/components/PropertyImage';
import HeroArrow from '@/src/components/HeroArrow';
import SwipeSection from '@/src/components/SwipeSection';
import InfoSections from '@/src/components/InfoSections';
import SiteFooter from '@/src/components/SiteFooter';
import BrandName from '@/src/components/BrandName';

type Props = { params: Promise<{ id: string }> };

// One Firestore read shared by generateMetadata and the page.
const loadItem = cache(async (id: string): Promise<Property | null> => {
  // The built-in samples shown before any item exists: /productos/sample-3 is the third sample.
  const sampleIndex = /^sample-(\d+)$/.exec(id)?.[1];
  if (sampleIndex) {
    const sample = sampleProperties[Number(sampleIndex) - 1];
    return sample ? { ...sample, id, agentId: '', createdAt: 0, updatedAt: 0 } : null;
  }
  try {
    const item = await getProperty(id);
    return item && item.status === 'active' ? item : null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) return { title: 'Producto no encontrado', robots: { index: false, follow: false } };
  return {
    title: item.title,
    description: item.description.slice(0, 160),
    openGraph: { title: item.title, description: item.description.slice(0, 160), images: item.photos[0] ? [item.photos[0].url] : [] },
  };
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) notFound();

  const custom = await getCategories().catch(() => []);
  const category = mergeCategories(custom).find((c) => c.id === item.type)?.name ?? item.type;
  const isSample = id.startsWith('sample-');
  const inStock = item.inStock !== false;
  const quantity = formatQuantity(item.weight, item.unit);
  const photo = item.photos[0]?.url;
  const pricing = {
    price: item.price,
    salePrice: item.salePrice,
    pricingMode: item.pricingMode,
    boxWeight: item.boxWeight,
    unitWeight: item.unitWeight,
    boxPrice: item.boxPrice,
    unitPrice: item.unitPrice,
    boxUnits: item.boxUnits,
    looseAllowed: item.looseAllowed,
  };

  // "Más vendidos": the items marked as featured first (they are the best sellers), then the rest (at most 10).
  // Which items customers order together can't be shown here: orders are private to staff.
  const pool: Property[] = isSample
    ? sampleProperties.map((p, i) => ({ ...p, id: `sample-${i + 1}`, agentId: '', createdAt: 0, updatedAt: 0 }))
    : await getActiveProperties().catch(() => []);
  // Swiping the mobile hero moves through the catalog in this order (wrapping around at the ends).
  const order = pool.map((p) => String(p.id));
  const at = order.indexOf(String(item.id));
  const prevHref = at >= 0 && order.length > 1 ? `/productos/${order[(at - 1 + order.length) % order.length]}` : undefined;
  const nextHref = at >= 0 && order.length > 1 ? `/productos/${order[(at + 1) % order.length]}` : undefined;
  const others = pool.filter((p) => p.id !== item.id);
  const similar: SimilarItem[] = [...others.filter((p) => p.featured), ...others.filter((p) => !p.featured)]
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.photos[0]?.url ?? '',
      price: withUnitSuffix(formatMoney(p.price, p.currency), p.pricingMode),
      salePrice: p.salePrice === undefined ? undefined : withUnitSuffix(formatMoney(p.salePrice, p.currency), p.pricingMode),
      quantity: formatQuantity(p.weight, p.unit),
      inStock: p.inStock !== false,
    }));

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] max-md:bg-[var(--brand-bg,#2E7D32)] text-[#1D1D1F] font-sans antialiased">
      <header className="fixed inset-x-0 top-0 z-30 text-white max-md:bg-[color-mix(in_srgb,var(--brand-bg,#2E7D32)_85%,transparent)] max-md:backdrop-blur-md max-md:backdrop-saturate-150 md:static md:text-[#1D1D1F] md:border-b md:border-[#000000]/5 md:bg-[#FBFBFD]">
        <div className="bg-black text-white text-center text-[11px] sm:text-xs font-medium tracking-wide py-1.5 px-4 sm:px-6 leading-snug pt-[calc(0.375rem+env(safe-area-inset-top))] md:pt-1.5">
          <span>Entregas diarias en Maldonado y Punta del Este</span>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-sm min-[420px]:text-base sm:text-lg tracking-tight"><BrandName onDark /></Link>
          <SiteNavLinks />
          <div className="flex items-center gap-3">
            <WholesaleAccess glass />
            {/* Phones use the cart in the bottom bar; the nav keeps it on tablets and desktop only. */}
            <span className="max-md:hidden contents"><CartButton glass /></span>
            <MobileNavMenu bare />
          </div>
        </div>
      </header>

      <main className="max-md:bg-[#FBFBFD] max-md:mt-[calc(env(safe-area-inset-top)+5.75rem)] max-md:rounded-t-3xl max-w-[1440px] mx-auto px-6 pt-10 pb-0 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-16 items-start">
        {/* Mobile: a white sheet with rounded top corners under the fixed green nav; the photo in a rounded box, product info below it */}
        <SwipeSection prevHref={prevHref} nextHref={nextHref} className="md:hidden relative -mx-6 -mt-10 flex flex-col rounded-t-3xl bg-[#FBFBFD]">
          <div className="relative mx-4 mt-4 aspect-square rounded-3xl overflow-hidden bg-[#E5E5EA] shadow-xl shadow-black/15">
            {photo && (
              <PropertyImage
                src={photo}
                alt={item.title}
                variant="gallery"
                sizes="100vw"
                priority
                className={`object-cover ${inStock ? '' : 'opacity-50 grayscale'}`}
              />
            )}
            <Link
              href="/productos"
              className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 text-sm font-medium text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Catálogo
            </Link>
            <FavoriteButton productId={String(item.id)} title={item.title} className="absolute top-3 right-3 w-10 h-10 z-10" />
            {!inStock && (
              <span className="absolute bottom-3 left-3 z-10 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Sin stock
              </span>
            )}
            {prevHref && <HeroArrow dir="prev" href={prevHref} />}
            {nextHref && <HeroArrow dir="next" href={nextHref} />}
          </div>
          <div className="relative z-10 px-6 pt-6 pb-4 space-y-4 text-[#1D1D1F]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#515154] font-semibold">{category}</p>
                <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
              </div>
              <div className="shrink-0 text-right">
                <ItemPriceView glass categoryId={item.type} pricing={pricing} />
              </div>
            </div>
            {item.description && (
              <p className="text-sm text-[#515154] font-light leading-relaxed whitespace-pre-line">{item.description}</p>
            )}
            <BuyBox
              onPhoto
              itemId={isSample ? Number(id.replace('sample-', '')) : item.id}
              title={item.title}
              image={photo ?? ''}
              pricing={pricing}
              categoryId={item.type}
              inStock={inStock}
            />
          </div>
        </SwipeSection>
        <div className="md:hidden relative z-10 pb-6">
          <BuyBox signInOnly itemId={isSample ? Number(id.replace('sample-', '')) : item.id} title={item.title} image={photo ?? ''} pricing={pricing} categoryId={item.type} inStock={inStock} />
        </div>

        <Link
          href="/productos"
          className="hidden md:inline-flex md:col-span-2 justify-self-start md:-mb-10 items-center gap-2 text-sm font-medium text-[#515154] hover:text-[#1D1D1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Volver al Catálogo
        </Link>
        <div className="hidden md:block relative aspect-square rounded-2xl overflow-hidden bg-[#E5E5EA]">
          {photo && (
            <PropertyImage
              src={photo}
              alt={item.title}
              variant="gallery"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className={`object-cover ${inStock ? '' : 'opacity-50 grayscale'}`}
            />
          )}
          <FavoriteButton productId={String(item.id)} title={item.title} className="absolute top-4 right-4 w-10 h-10 z-10" />
          {!inStock && (
            <span className="absolute top-4 left-4 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Sin stock
            </span>
          )}
        </div>

        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="hidden md:block space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#515154] font-semibold">{category}</p>
              <h1 className="text-5xl font-semibold tracking-tight">{item.title}</h1>
              <ItemPriceView categoryId={item.type} pricing={pricing} />
              {quantity && (
                <p className="text-sm text-[#515154]">
                  <span className="font-medium text-[#1D1D1F]">Peso:</span> {quantity}
                </p>
              )}
              <p className="text-sm text-[#515154]">
                <span className="font-medium text-[#1D1D1F]">Entrega en:</span>{' '}
                {(item.deliveryAreas?.length ? item.deliveryAreas : ['Maldonado']).join(', ')}
              </p>
            </div>
            {item.description && (
              <p className="hidden md:block text-[#515154] font-light leading-relaxed whitespace-pre-line">{item.description}</p>
            )}
          </div>

          <div className="hidden md:block">
            <BuyBox
            itemId={isSample ? Number(id.replace('sample-', '')) : item.id}
            title={item.title}
            image={photo ?? ''}
            pricing={pricing}
            categoryId={item.type}
            inStock={inStock}
          />
          </div>
        </div>
      </main>

      <SimilarItems title="Más vendidos" items={similar} />

      <InfoSections />

      <SiteFooter />
    </div>
  );
}
