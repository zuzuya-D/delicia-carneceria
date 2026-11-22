'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductoCard } from '@/components/ProductoCard';
import { CATEGORIAS, productos } from '@/lib/data';

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function Catalogo() {
  const sp = useSearchParams(); const router = useRouter(); const ruta = usePathname();
  const cat = sp.get('cat') ?? ''; const qUrl = sp.get('q') ?? '';
  const [q, setQ] = useState(qUrl);
  useEffect(() => setQ(qUrl), [qUrl]);

  // Mantiene filtro y búsqueda en la URL (se pueden compartir y usar el botón Atrás)
  const ir = (c: string, texto: string) => {
    const p = new URLSearchParams(); if (c) p.set('cat', c); if (texto.trim()) p.set('q', texto.trim());
    const s = p.toString();
    router.replace(`${ruta}${s ? `?${s}` : ''}`, { scroll: false });
  };
  const nq = normalizar(q.trim());
  const lista = productos.filter((p) => (!cat || p.categoria === cat) && (!nq || normalizar(`${p.nombre_corte} ${p.categoria}`).includes(nq)));
  const chip = (activo: boolean) => `rounded-full border px-4 py-1.5 text-sm ${activo ? 'border-brand bg-brand text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:bg-brand-light'}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="border-l-4 border-brand pl-3 text-2xl font-bold">Productos</h1>
      <div className="my-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={chip(!cat)} aria-pressed={!cat} onClick={() => ir('', q)}>Todos</button>
          {CATEGORIAS.map((c) => <button type="button" key={c} className={chip(cat === c)} aria-pressed={cat === c} onClick={() => ir(c, q)}>{c}</button>)}
        </div>
        <form role="search" className="flex w-full gap-2 md:w-80" onSubmit={(e) => { e.preventDefault(); ir(cat, q); }}>
          <label htmlFor="buscar-cat" className="sr-only">Buscar en el catálogo</label>
          <input id="buscar-cat" type="search" className="input" placeholder="Buscar corte… (ej. bistec)" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="btn-brand">Buscar</button>
        </form>
      </div>
      <p className="mb-3 text-sm text-neutral-600" aria-live="polite">
        {lista.length} {lista.length === 1 ? 'producto' : 'productos'}{cat && ` en ${cat}`}{nq && ` para “${q.trim()}”`} · precios por kilogramo
      </p>
      {lista.length === 0 ? <p className="rounded-lg bg-white p-8 text-center text-neutral-600">No encontramos productos con ese criterio.</p> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{lista.map((p) => <ProductoCard key={p.id_producto} p={p} />)}</div>
      )}
    </div>
  );
}
