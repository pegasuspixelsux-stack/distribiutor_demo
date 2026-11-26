import { Heart, KeyRound, Menu, Plus, Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';

/**
 * Desktop homepage hero: a phone showing the mobile catalog page, built in code (crisp at any size) and cut at 3/4 of
 * its height. Everything inside is sized in cqw of the phone, as if the screen were 390 px wide (an iPhone), so it
 * scales as one picture. The products are fixed sample content, not the live catalog.
 */

// The phone is 414 units wide: a 390-unit screen plus a 12-unit bezel on each side. 1 unit = 100cqw / 414.
const p = (n: number) => `calc(${n} * 100cqw / 414)`;
const PHONE_W = 414;
const PHONE_H = 868; // 844-unit screen + bezel
const VISIBLE = 0.75;

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=320&h=320&auto=format&fit=crop`;
const PRODUCTS = [
  { name: 'Tomate perita', weight: '1 kg', price: '$ 180 / kg', img: '1592924357228-91a4daadcfea' },
  { name: 'Mandarina clementina', weight: '1 kg', price: '$ 88 / kg', img: '1557800636-894a64c1696f' },
  { name: 'Ananá dorado', weight: '1,8 kg', price: '$ 152 por unidad', img: '1550258987-190a2d41a8ba' },
  { name: 'Sandía sin semillas', weight: '8 kg', price: '$ 276 por unidad', img: '1587049352846-4a222e784d38' },
  { name: 'Papa blanca', weight: '1 kg', price: '$ 34 / kg', img: '1518977676601-b53f82aba655' },
];
const CHIPS = ['Todas', 'Frutas', 'Verduras', 'Tropicales'];

export default function CatalogPhoneMockup({ brand, className = '' }: { brand: string; className?: string }) {
  return (
    <div className={`[container-type:inline-size] ${className}`}>
      {/* The 3/4 cut: only the top of the phone shows, fading out at the bottom edge */}
      <div
        className="relative overflow-hidden [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
        style={{ aspectRatio: `${PHONE_W} / ${PHONE_H * VISIBLE}` }}
      >
        <div
          role="img"
          aria-label={`El catálogo de ${brand} en el celular: búsqueda, categorías y productos con precio`}
          className="absolute inset-x-0 top-0 bg-[#0A0A0A] shadow-[0_30px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
          style={{ height: p(PHONE_H), padding: p(12), borderRadius: p(64) }}
        >
          <div className="relative h-full overflow-hidden bg-[var(--brand-bg,#0B2A14)] text-[#1D1D1F]" style={{ borderRadius: p(52) }}>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full z-10" style={{ top: p(11), width: p(122), height: p(34) }} />
            {/* Status bar */}
            <div className="flex items-center justify-between text-white font-semibold" style={{ height: p(54), padding: `0 ${p(34)}`, fontSize: p(16) }}>
              <span>9:41</span>
              <span className="flex items-center" style={{ gap: p(5) }}>
                <span className="bg-white rounded-[2px]" style={{ width: p(17), height: p(10) }} />
                <span className="border border-white rounded-[3px]" style={{ width: p(25), height: p(12) }} />
              </span>
            </div>
            {/* Delivery strip */}
            <div className="bg-black text-white text-center font-medium" style={{ fontSize: p(11), padding: `${p(6)} 0` }}>
              Entregas diarias en Maldonado y Punta del Este
            </div>
            {/* Nav */}
            <div className="flex items-center justify-between" style={{ height: p(64), padding: `0 ${p(20)}` }}>
              <span className="text-white font-semibold tracking-tight truncate" style={{ fontSize: p(17) }}>{brand}</span>
              <span className="flex items-center text-white" style={{ gap: p(8) }}>
                {[KeyRound, ShoppingCart, Menu].map((Icon, i) => (
                  <span key={i} className="flex items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30" style={{ width: p(38), height: p(38) }}>
                    <Icon style={{ width: p(18), height: p(18) }} aria-hidden="true" />
                  </span>
                ))}
              </span>
            </div>

            {/* Catalog sheet */}
            <div className="bg-[#ECECF1]" style={{ marginTop: p(10), borderRadius: `${p(26)} ${p(26)} 0 0`, padding: `${p(16)} ${p(12)} 0` }}>
              {/* Search */}
              <div className="flex items-center bg-white shadow-sm" style={{ gap: p(10), padding: `${p(8)} ${p(8)} ${p(8)} ${p(20)}`, borderRadius: p(20) }}>
                <span className="flex-1 text-[#86868B] truncate" style={{ fontSize: p(16) }}>Buscá por nombre, categoría…</span>
                <SlidersHorizontal className="text-[#515154]" style={{ width: p(18), height: p(18) }} aria-hidden="true" />
                <span className="flex items-center justify-center rounded-full bg-[#2E7D32] text-white" style={{ width: p(44), height: p(44) }}>
                  <Search style={{ width: p(18), height: p(18) }} aria-hidden="true" />
                </span>
              </div>
              {/* Categories */}
              <div className="flex overflow-hidden" style={{ gap: p(8), marginTop: p(16) }}>
                {CHIPS.map((c, i) => (
                  <span
                    key={c}
                    className={`shrink-0 rounded-full font-medium ${i === 0 ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#1D1D1F]'}`}
                    style={{ fontSize: p(13), padding: `${p(8)} ${p(16)}` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="font-bold tracking-tight" style={{ fontSize: p(21), margin: `${p(18)} 0 ${p(12)}` }}>Nuestros productos</p>
              {/* Product list */}
              <div className="flex flex-col" style={{ gap: p(10) }}>
                {PRODUCTS.map((item) => (
                  <div key={item.name} className="flex items-stretch bg-white overflow-hidden" style={{ borderRadius: p(16), height: p(128) }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo(item.img)} alt="" className="object-cover shrink-0" style={{ width: p(128), height: p(128) }} />
                    <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ padding: `0 ${p(12)}` }}>
                      <p className="font-semibold truncate" style={{ fontSize: p(15) }}>{item.name}</p>
                      <p className="text-[#515154]" style={{ fontSize: p(13), marginTop: p(2) }}>{item.weight}</p>
                      <p className="font-bold" style={{ fontSize: p(17), marginTop: p(8) }}>{item.price}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center" style={{ gap: p(10), paddingRight: p(12) }}>
                      <span className="flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5" style={{ width: p(34), height: p(34) }}>
                        <Heart style={{ width: p(16), height: p(16) }} aria-hidden="true" />
                      </span>
                      <span className="flex items-center justify-center rounded-full bg-[#2E7D32] text-white" style={{ width: p(34), height: p(34) }}>
                        <Plus style={{ width: p(16), height: p(16) }} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
