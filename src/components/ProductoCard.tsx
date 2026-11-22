'use client';
import { useEffect, useState } from 'react';
import { soles } from '@/lib/format';
import { esMayorista, precioPara, useAuth, useCart } from '@/lib/providers';
import type { Producto } from '@/lib/types';
import { ProductoTile } from './ProductoTile';

export function ProductoCard({ p }: { p: Producto }) {
  const { sesion } = useAuth(); const { agregar } = useCart(); const [ok, setOk] = useState(false);
  useEffect(() => { if (!ok) return; const t = setTimeout(() => setOk(false), 1500); return () => clearTimeout(t); }, [ok]);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-card" aria-labelledby={`prod-${p.id_producto}`}>
      <ProductoTile p={p} />
      <div className="flex flex-1 flex-col gap-2 p-4 text-center">
        <h3 id={`prod-${p.id_producto}`} className="font-semibold">{p.nombre_corte}</h3>
        <p className="text-lg font-bold">{soles(precioPara(p, sesion))} <span className="text-sm font-normal text-neutral-600">/ kg</span></p>
        {esMayorista(sesion) && <p className="-mt-1 text-xs text-neutral-600">Precio por mayor</p>}
        <button type="button" className="btn-brand mt-auto w-full" aria-label={`Agregar 1 kg de ${p.nombre_corte} al carrito`} onClick={() => { agregar(p, 1); setOk(true); }}>
          {ok ? '✓ Agregado' : 'Agregar al carrito'}
        </button>
        <span className="sr-only" aria-live="polite">{ok ? `${p.nombre_corte} agregado al carrito` : ''}</span>
      </div>
    </article>
  );
}
