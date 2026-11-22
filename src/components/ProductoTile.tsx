import { FOTOS_PRODUCTO } from '@/lib/data';
import type { Producto } from '@/lib/types';

const TONOS: Record<string, string> = {
  Vacuno: 'from-red-700 to-red-900', Molidos: 'from-rose-600 to-red-800', Embutidos: 'from-orange-500 to-red-700',
  Menudencia: 'from-fuchsia-800 to-red-900', Preparados: 'from-amber-600 to-red-800',
};
/** Imagen del producto (decorativa: el nombre va al lado). Sin foto registrada se muestra un bloque de color. */
export function ProductoTile({ p, className = 'h-40', etiqueta = true }: { p: Producto; className?: string; etiqueta?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-t-xl bg-gradient-to-br ${TONOS[p.categoria] ?? TONOS.Vacuno} ${className}`}>
      {FOTOS_PRODUCTO.includes(p.id_producto) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/productos/${p.id_producto}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      {etiqueta && <span className="absolute bottom-2 left-3 rounded bg-black/50 px-2 py-0.5 text-xs font-medium text-white">{p.categoria}</span>}
    </div>
  );
}
