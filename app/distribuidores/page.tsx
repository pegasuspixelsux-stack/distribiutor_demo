import type { Metadata } from 'next';
import { Minus, Plus, RotateCcw, Send } from 'lucide-react';
import { SHARE_DESCRIPTION, SHARE_IMAGE, SHARE_IMAGE_ALT, SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, SHARE_TITLE } from '@/src/lib/siteMeta';

// Desktop promo page for distributors, built to be screenshotted at 1200 x 630 for link previews (WhatsApp, Facebook,
// LinkedIn, X). Rendered on the server, with no site navigation, footer or floating widgets: only the hero.
//
// Taking the screenshot: open /distribuidores in a 1200 x 630 browser viewport (or any desktop size with the same
// 1.9 : 1 shape: everything scales with the viewport) and capture the whole viewport. Save it as public/og/ with a NEW
// file name each time (distribuidores-v2.jpg, ...), because WhatsApp caches previews by URL, and update SHARE_IMAGE in
// src/lib/siteMeta.ts (the whole site uses this preview).

/** Swap the built-in interface preview for a real screenshot: set a path in public/ (or a full image URL). */
const SHOWCASE_IMAGE: string | null = null;

export const metadata: Metadata = {
  title: 'Sistema de pedidos para distribuidoras',
  description: SHARE_DESCRIPTION,
  alternates: { canonical: '/distribuidores' },
  openGraph: {
    type: 'website',
    url: '/distribuidores',
    locale: 'es_UY',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [{ url: SHARE_IMAGE, width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT, alt: SHARE_IMAGE_ALT, type: 'image/jpeg' }],
  },
  twitter: { card: 'summary_large_image', title: SHARE_TITLE, description: SHARE_DESCRIPTION, images: [SHARE_IMAGE] },
};

/** Sample order shown in the interface preview: client price, list price, box and quantity. */
const LINES = [
  { name: 'Tomate perita', unit: 'Caja 18 kg', price: 1180, list: 1390, qty: 3, photo: '1592924357228-91a4daadcfea' },
  { name: 'Lechuga crespa', unit: 'Jaula 12 u.', price: 540, list: 620, qty: 2, photo: '1540420773420-3366772f4999' },
  { name: 'Papa blanca', unit: 'Bolsa 25 kg', price: 860, list: 990, qty: 4, photo: '1518977676601-b53f82aba655' },
  { name: 'Mandarina', unit: 'Caja 20 kg', price: 1320, list: 1500, qty: 1, photo: '1557800636-894a64c1696f' },
];

const money = (n: number) => `$ ${n.toLocaleString('es-UY')}`;

/**
 * Sizes use --u, 1% of a 1200 px wide 1200 x 630 frame: min(1vw, 1.905vh). At exactly 1200 x 630 one unit is 12 px;
 * on larger desktop screens everything grows in proportion, so the frame always looks the same.
 */
const u = (n: number) => `calc(var(--u)*${n})`;

export default function DistribuidoresPage() {
  const total = LINES.reduce((s, l) => s + l.price * l.qty, 0);
  return (
    <main
      className="relative w-full h-screen overflow-hidden bg-[#0B2A14] text-white font-sans antialiased [--u:min(1vw,1.905vh)] flex items-center justify-center"
      style={{ padding: `${u(4)} ${u(6)}` }}
    >
      {/* Soft green light behind the showcase, darker toward the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_50%,rgba(76,175,80,0.45)_0%,rgba(46,125,50,0.18)_38%,transparent_70%)]"
      />

      <div className="relative w-full h-full grid grid-cols-[55fr_45fr] items-center" style={{ gap: u(5) }}>
        {/* Left: the pitch, legible even as a small WhatsApp thumbnail */}
        <div className="flex flex-col h-full justify-center min-w-0">
          <span
            className="self-start rounded-full bg-[#C6F432] text-[#0B2A14] font-bold uppercase whitespace-nowrap"
            style={{ fontSize: u(1.25), letterSpacing: '0.14em', padding: `${u(0.7)} ${u(1.5)}` }}
          >
            Sistema de pedidos B2B para distribuidoras
          </span>
          <h1
            className="font-extrabold tracking-[-0.03em] leading-[1.02] text-balance"
            style={{ fontSize: u(5.2), marginTop: u(2.4) }}
          >
            Recibí y gestioná los pedidos de tus clientes <span className="text-[#C6F432]">sin caos.</span>
          </h1>
          <p className="text-white/80 leading-[1.35] text-pretty" style={{ fontSize: u(1.85), marginTop: u(2.2), maxWidth: u(48) }}>
            Tus clientes ven sus precios, repiten pedidos en segundos y vos recibís todo ordenado, sin errores por teléfono
            ni mensajes perdidos.
          </p>
          <div className="flex items-center" style={{ gap: u(1.2), marginTop: u(3.4) }}>
            <span
              className="rounded-full border border-white/25 bg-white/10 font-semibold whitespace-nowrap"
              style={{ fontSize: u(1.3), padding: `${u(0.75)} ${u(1.6)}` }}
            >
              Acceso directo para tus clientes
            </span>
            <span className="text-white/60 font-medium whitespace-nowrap" style={{ fontSize: u(1.3) }}>
              Pegasus Pixels
            </span>
          </div>
        </div>

        {/* Right: the ordering system, framed */}
        <div className="flex items-center justify-center min-w-0">
          {SHOWCASE_IMAGE ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={SHOWCASE_IMAGE}
              alt="Pantalla del sistema de pedidos"
              className="block w-full h-auto rounded-[1.25rem] border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
            />
          ) : (
            <ShowcasePreview total={total} />
          )}
        </div>
      </div>
    </main>
  );
}

/** A clean, static picture of the client catalog: prices per client, quantity steppers and the order summary. */
function ShowcasePreview({ total }: { total: number }) {
  return (
    <div
      aria-label="Vista del sistema: productos con precio del cliente, cantidades y resumen del pedido"
      role="img"
      className="w-full bg-white text-[#1D1D1F] border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.45)] overflow-hidden"
      style={{ borderRadius: u(1.8) }}
    >
      {/* Window bar */}
      <div className="flex items-center bg-[#F2F2F5] border-b border-black/5" style={{ gap: u(0.6), padding: `${u(1)} ${u(1.4)}` }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} className="rounded-full" style={{ width: u(0.9), height: u(0.9), background: c }} />
        ))}
        <span className="ml-auto text-[#6E6E73] font-medium" style={{ fontSize: u(1.05) }}>
          pedidos.tudistribuidora.uy
        </span>
      </div>

      <div style={{ padding: `${u(1.5)} ${u(1.8)} ${u(1.8)}` }}>
        {/* Client header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[#6E6E73] font-medium" style={{ fontSize: u(1.1) }}>Hola, Restaurante La Huerta</p>
            <p className="font-bold tracking-tight" style={{ fontSize: u(1.9) }}>Tu catálogo</p>
          </div>
          <span
            className="rounded-full bg-[#E8F5E9] text-[#1B5E20] font-semibold"
            style={{ fontSize: u(1), padding: `${u(0.45)} ${u(1)}` }}
          >
            Precio cliente · Gastronomía
          </span>
        </div>
        {/* Product lines */}
        <ul className="divide-y divide-black/5" style={{ marginTop: u(0.6) }}>
          {LINES.map((l) => (
            <li key={l.name} className="flex items-center" style={{ gap: u(1.1), padding: `${u(0.75)} 0` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://images.unsplash.com/photo-${l.photo}?q=80&w=160&h=160&auto=format&fit=crop`}
                alt=""
                className="object-cover shrink-0"
                style={{ width: u(3.6), height: u(3.6), borderRadius: u(0.8) }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate" style={{ fontSize: u(1.3) }}>{l.name}</p>
                <p className="text-[#86868B]" style={{ fontSize: u(1) }}>{l.unit}</p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ fontSize: u(1.3) }}>{money(l.price)}</p>
                <p className="text-[#86868B] line-through" style={{ fontSize: u(0.95) }}>{money(l.list)}</p>
              </div>
              <div
                className="flex items-center bg-[#F5F5F7]"
                style={{ gap: u(0.5), padding: u(0.3), borderRadius: u(2) }}
              >
                <span className="flex items-center justify-center rounded-full bg-white shadow-sm" style={{ width: u(2.2), height: u(2.2) }}>
                  <Minus style={{ width: u(1), height: u(1) }} aria-hidden="true" />
                </span>
                <span className="text-center font-semibold" style={{ width: u(1.6), fontSize: u(1.2) }}>{l.qty}</span>
                <span className="flex items-center justify-center rounded-full bg-[#2E7D32] text-white" style={{ width: u(2.2), height: u(2.2) }}>
                  <Plus style={{ width: u(1), height: u(1) }} aria-hidden="true" />
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <div className="bg-[#F5F5F7]" style={{ marginTop: u(0.8), padding: u(1.3), borderRadius: u(1.2) }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[#6E6E73] font-medium" style={{ fontSize: u(1.15) }}>Total del pedido · entrega mañana 7:00</span>
            <span className="font-extrabold tracking-tight" style={{ fontSize: u(2) }}>{money(total)}</span>
          </div>
          <div className="grid grid-cols-2" style={{ gap: u(0.9), marginTop: u(1) }}>
            <span
              className="flex items-center justify-center border border-black/10 bg-white font-semibold"
              style={{ gap: u(0.6), padding: `${u(0.9)} 0`, borderRadius: u(2), fontSize: u(1.2) }}
            >
              <RotateCcw style={{ width: u(1.2), height: u(1.2) }} aria-hidden="true" />
              Repetir último pedido
            </span>
            <span
              className="flex items-center justify-center bg-[#2E7D32] text-white font-semibold"
              style={{ gap: u(0.6), padding: `${u(0.9)} 0`, borderRadius: u(2), fontSize: u(1.2) }}
            >
              <Send style={{ width: u(1.2), height: u(1.2) }} aria-hidden="true" />
              Enviar pedido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
