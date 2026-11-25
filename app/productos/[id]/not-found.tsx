import Link from 'next/link';
import BrandName from '@/src/components/BrandName';

export default function ItemNotFound() {
  return (
    <main className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold tracking-tight"><BrandName /></p>
        <h1 className="text-3xl font-semibold tracking-tight">Producto no encontrado</h1>
        <p className="text-sm text-[#515154]">Este producto no existe o ya no está disponible.</p>
        <Link href="/productos" className="inline-block bg-[#1D1D1F] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all">
          Ver todos los productos
        </Link>
      </div>
    </main>
  );
}
