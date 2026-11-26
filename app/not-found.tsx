import Link from 'next/link';
import BrandName from '@/src/components/BrandName';

/** Any address that does not exist on the site. */
export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold tracking-tight"><BrandName /></p>
        <h1 className="text-3xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="text-sm text-[#515154]">Esta dirección no existe o cambió.</p>
        <Link href="/productos" className="inline-flex min-h-11 items-center bg-[#1D1D1F] text-white text-sm font-medium px-6 rounded-full hover:bg-[#333336] transition-colors">
          Ver el catálogo
        </Link>
      </div>
    </main>
  );
}
