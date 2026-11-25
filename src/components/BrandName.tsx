'use client';

import { useBusiness } from '@/src/context/BusinessContext';
import { brandOf } from '@/src/lib/siteMeta';

/**
 * The brand for the top nav: the logo uploaded in Ajustes, or, when there is none, the business name
 * from Ajustes as a text title (falls back to the site title if the name is empty).
 * `onDark`: the nav sits on a dark photo on phones (item page), so the text title turns white there.
 * Inline content: put it inside the heading / link.
 */
export default function BrandName({ onDark = false }: { onDark?: boolean }) {
  const business = useBusiness();
  const { logo } = business;
  const title = brandOf(business);
  if (logo) {
    return (
      <span className="inline-flex items-center align-middle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={title} className="h-11 w-auto max-w-44 object-contain shrink-0" />
      </span>
    );
  }
  return (
    <span className={`inline-block align-middle truncate max-w-[60vw] md:max-w-md text-[#1D1D1F] ${onDark ? 'max-md:text-white' : ''}`}>
      {title}
    </span>
  );
}
