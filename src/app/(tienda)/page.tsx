import Link from 'next/link';
import { ProductoCard } from '@/components/ProductoCard';
import { productos } from '@/lib/data';

export default function Inicio() {
  return (
    <>
      <section className="bg-gradient-to-br from-neutral-900 via-red-950 to-red-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Carnes de calidad, sabor que te <span className="text-red-400">encanta</span></h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-200">Cortes únicos de res y embutidos, para tu hogar o negocio.</p>
          <Link href="/productos" className="btn-brand mt-8 !rounded-full !px-6 !py-3 text-base">Realizar Pedido <span aria-hidden>→</span></Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="border-l-4 border-brand pl-3 text-2xl font-bold">Productos destacados</h2>
          <Link href="/productos" className="text-sm font-semibold text-brand">Ver todos →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{productos.slice(0, 4).map((p) => <ProductoCard key={p.id_producto} p={p} />)}</div>
      </section>
      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 text-sm sm:grid-cols-3">
          {[['🚚', 'Envío local', 'en Andahuaylas'], ['🏪', 'Recojo en tienda', 'en nuestros 2 locales'], ['💳', 'Pago seguro', 'Efectivo o Yape']].map(([i, t, d]) => (
            <div key={t} className="flex items-center gap-3"><span className="text-3xl" aria-hidden>{i}</span><p><b className="block text-base">{t}</b><span className="text-neutral-600">{d}</span></p></div>
          ))}
        </div>
      </section>
    </>
  );
}
