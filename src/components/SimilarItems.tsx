'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyImage from '@/src/components/PropertyImage';
import FavoriteButton from '@/src/components/FavoriteButton';

export interface SimilarItem {
  id: string;
  title: string;
  image: string;
  /** Formatted regular price. */
  price: string;
  /** Formatted sale price, when on sale. */
  salePrice?: string;
  /** e.g. "12 lb". */
  quantity: string;
  inStock: boolean;
}

/** Horizontal slider of other items; swipe on touch screens, arrows on desktop. */
export default function SimilarItems({ title, items, embedded = false }: { title: string; items: SimilarItem[]; embedded?: boolean }) {
  const track = useRef<HTMLUListElement>(null);
  if (items.length === 0) return null;

  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section
      aria-label={title}
      className={embedded ? 'w-full pt-1 pb-2' : 'max-w-[1440px] mx-auto px-6 pt-4 md:pt-0 md:-mt-14 pb-8 md:pb-10 max-md:bg-white max-md:mt-0 max-md:w-full max-md:rounded-b-3xl max-md:pb-10 max-md:mb-3'}
    >
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Desplazar a la izquierda" className="w-10 h-10 rounded-full bg-white border border-[#000000]/5 flex items-center justify-center hover:bg-[#F5F5F7]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Desplazar a la derecha" className="w-10 h-10 rounded-full bg-white border border-[#000000]/5 flex items-center justify-center hover:bg-[#F5F5F7]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        className={`flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth ${embedded ? '-mx-3 px-3 md:mx-0 md:px-0 scroll-pl-3 md:scroll-pl-0' : '-mx-6 px-6 scroll-pl-6'} pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {items.map((item) => (
          <li key={item.id} className={`snap-start shrink-0 ${
              embedded
                ? 'w-[calc((100%-12px)/2*0.75)] md:w-[calc((100%-48px)/3*0.75)] lg:w-[calc((100%-72px)/4*0.75)]' // 3/4 of a catalog grid card
                : 'w-[60%] sm:w-[40%] md:w-[28%] lg:w-[22%]'
            }`}>
            <Link href={`/productos/${item.id}`} className="group relative block aspect-square rounded-2xl overflow-hidden bg-[#E5E5EA]">
              <PropertyImage
                src={item.image}
                alt={item.title}
                variant="card"
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 28vw, 60vw"
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.inStock ? '' : 'opacity-50 grayscale'}`}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {!item.inStock && (
                <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">Sin stock</span>
              )}
              <FavoriteButton productId={item.id} title={item.title} className="absolute top-3 right-3 z-10 w-8 h-8" />
              {/* Text inside the card, over the photo */}
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white">
                <h3 className="text-sm md:text-base font-semibold tracking-tight leading-tight line-clamp-2">{item.title}</h3>
                <p className="mt-1.5 text-xs md:text-sm flex flex-wrap items-end justify-between gap-x-2">
                  <span className="text-white/80 truncate">{item.quantity}</span>
                  <span className="max-w-full font-semibold">
                    {item.salePrice ? (
                      <>
                        <s className="font-normal text-white/60 mr-1.5">{item.price}</s>
                        {item.salePrice}
                      </>
                    ) : (
                      item.price
                    )}
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
