'use client';
import { Titulo } from '@/components/Shell';
import { locales } from '@/lib/data';
import { type Config, useConfig } from '@/lib/hooks';

const SW: { k: keyof Omit<Config, 'tiempoMax'>; t: string }[] = [
  { k: 'ventaOnline', t: 'Habilitar venta en línea' }, { k: 'delivery', t: 'Habilitar envío (Delivery)' },
  { k: 'efectivo', t: 'Habilitar pago en efectivo' }, { k: 'yape', t: 'Habilitar Yape' },
];

export default function Configuracion() {
  const [c, setC] = useConfig();
  return (
    <>
      <Titulo t="Configuración Global del Sistema" s="Parámetros de la tienda en línea (se aplican al carrito de inmediato)" />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="dk-card"><h2 className="mb-3 font-semibold">Preferencias del sistema</h2>
          {SW.map(({ k, t }) => (<label key={k} className="flex items-center justify-between border-b border-ink-line py-3 text-sm last:border-0">{t}
            <input type="checkbox" role="switch" className="h-5 w-10 cursor-pointer accent-red-600" checked={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.checked })} /></label>))}
          <label className="flex items-center justify-between py-3 text-sm">Tiempo máximo de preparación (min)
            <input type="number" min={5} max={240} className="dk-input !w-24 text-right" value={c.tiempoMax} onChange={(e) => setC({ ...c, tiempoMax: Math.max(5, Math.min(240, +e.target.value || 5)) })} /></label>
          <p className="text-xs text-neutral-400">Unidad de peso: kg (fija).</p></section>
        <section className="dk-card"><h2 className="mb-3 font-semibold">Locales activos</h2>
          {locales.map((l) => (<div key={l.id_local} className="border-b border-ink-line py-3 last:border-0"><p className="text-sm font-medium">{l.nombre_local} <span className="text-xs text-emerald-400">(Habilitado)</span></p><p className="text-xs text-neutral-400">{l.direccion}</p></div>))}</section>
      </div>
    </>
  );
}
