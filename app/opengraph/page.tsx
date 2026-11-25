import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import SiteFooter from '@/src/components/SiteFooter';
import { getBusinessSettings } from '@/src/services/businessService';
import { brandOf, SHARE_DESCRIPTION, SHARE_IMAGE, SHARE_IMAGE_ALT, SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, SHARE_TITLE } from '@/src/lib/siteMeta';

// Link preview (WhatsApp, Facebook, LinkedIn): rendered on the server so the crawler, which does not run JavaScript, sees it.
// The text and the screenshot (2400x1260, ~140 KB, well under WhatsApp's 600 KB limit) live in src/lib/siteMeta.ts.
export const metadata: Metadata = {
  title: 'Open Graph',
  description: SHARE_DESCRIPTION,
  alternates: { canonical: '/opengraph' },
  openGraph: {
    type: 'website',
    url: '/opengraph',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [{ url: SHARE_IMAGE, width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT, alt: SHARE_IMAGE_ALT, type: 'image/jpeg' }],
  },
  twitter: { card: 'summary_large_image', title: SHARE_TITLE, description: SHARE_DESCRIPTION, images: [SHARE_IMAGE] },
};

// Short on purpose: the page is a flyer that is opened from WhatsApp on a phone and has to fit one screen.
const benefits = [
  'Pedidos fáciles de procesar',
  'Precios dinámicos, cambios en segundos',
  'Niveles de precio por cliente',
  'Protegé tu margen en cada venta',
  'Tus clientes repiten su pedido en un clic',
  'Fidelizá con favoritos y app propia',
];

/**
 * Open Graph page, used as a flyer (shared on WhatsApp): it sells the ordering app to produce distributors.
 * A green full-screen (100vh) hero. Desktop: two columns, the pitch on the left and the catalog on a phone on the right.
 * Phone: one column, with the top of the catalog phone peeking in at the bottom so everything fits one screen.
 */
export default async function OpenGraphPage() {
  const business = await getBusinessSettings();
  const brand = brandOf(business);
  return (
    <div className="bg-[var(--brand-bg,#2E7D32)] text-white font-sans antialiased">
      {/* Hero: on a phone one tall column; from lg up a 1440 x 1440 px SQUARE with square corners, centered (it is the flyer
          that gets screenshotted). Everything inside is sized in cqw (1cqw = 1% of the square). */}
      <main className="min-h-[100vh] min-h-[100svh] lg:min-h-0 flex items-center justify-center lg:justify-start lg:bg-[#0B1F10] lg:overflow-x-auto">
        <div className="w-full lg:w-[1440px] lg:h-[1440px] lg:shrink-0 lg:mx-auto lg:[container-type:size] lg:bg-[var(--brand-bg,#2E7D32)] lg:overflow-hidden">
          <div className="w-full lg:h-full max-w-[1280px] lg:max-w-none mx-auto px-6 md:px-10 lg:px-[11cqw] pt-8 lg:py-[11cqw] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_39.4cqw] gap-6 lg:gap-[2.5cqw] items-center">
            {/* Left column: logo, heading, support text, benefits */}
            <div className="lg:h-full lg:flex lg:flex-col lg:justify-center lg:gap-[5.2cqw]">
              {business.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logo} alt={brand} className="h-12 lg:h-[10.9cqw] w-auto self-start object-contain drop-shadow-lg" />
              ) : (
                <p className="text-2xl lg:text-[3.2cqw] font-semibold tracking-tight drop-shadow-lg">{brand}</p>
              )}
              <div>
              <h1 className="mt-4 lg:mt-0 text-[clamp(1.5rem,6.4vw,3rem)] lg:text-[3.8cqw] font-semibold tracking-tight leading-[1.1] lg:leading-[1.02]">
                <span className="block whitespace-nowrap">La app de pedidos</span>
                <span className="block whitespace-nowrap">para distribuidores</span>
                <span className="block whitespace-nowrap">de frutas y verduras.</span>
              </h1>

              <ul className="mt-5 lg:mt-[4.4cqw] space-y-2.5 lg:space-y-[2.8cqw]">
                {benefits.map((text) => (
                  <li key={text} className="flex items-center gap-3 lg:gap-[1.2cqw] text-base lg:text-[1.9cqw] font-medium leading-snug">
                    <span className="flex h-6 w-6 lg:h-[2.45cqw] lg:w-[2.45cqw] shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3.5 w-3.5 lg:h-[1.55cqw] lg:w-[1.55cqw]" aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* Right column: a screen of the catalog, on a phone (on a phone screen only its top shows, cut off at the bottom edge) */}
            <div className="flex justify-center lg:justify-end lg:self-start max-lg:h-[200px] max-lg:overflow-hidden">
              <div className="relative h-fit w-[240px] lg:w-[39.4cqw] rounded-[2.5rem] lg:rounded-[3cqw] bg-[#0B1F10] p-2.5 lg:p-[0.9cqw] shadow-2xl shadow-black/40 ring-1 ring-white/20">
                <div className="absolute left-1/2 top-4 lg:top-[1.4cqw] z-10 h-5 w-20 lg:h-[1.7cqw] lg:w-[8cqw] -translate-x-1/2 rounded-full bg-[#0B1F10]" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/catalog-screen.webp"
                  alt="Pantalla del catálogo: búsqueda, categorías y productos con precio"
                  width={720}
                  height={1440}
                  className="block w-full h-auto rounded-[2rem] lg:rounded-[2.4cqw]"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
