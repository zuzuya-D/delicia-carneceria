'use client';
import { useState } from 'react';
import { Titulo } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { HOY } from '@/lib/data';
import { fechaCorta, kg, soles } from '@/lib/format';
import { useCompras } from '@/lib/hooks';
import { sum } from '@/lib/stats';

export default function Compras() {
  const [{ compras, camal }, setC] = useCompras();
  const vacio = { fecha: HOY, cabezas: '', costo: '', camal: '', kilos: '' };
  const [f, setF] = useState(vacio); const [err, setErr] = useState('');
  const filas = compras.map((c) => ({ c, k: camal.find((x) => x.id_compra === c.id_compra) })).sort((a, b) => b.c.fecha_compra.localeCompare(a.c.fecha_compra));
  const inversion = sum(compras.map((c) => c.costo_total_ganado)) + sum(camal.map((k) => k.costo_servicio_camal));
  const kilos = sum(camal.map((k) => k.kilos_obtencion_total)); const cabezas = sum(compras.map((c) => c.cantidad_cabezas));
  const num = (s: string) => parseFloat(s.replace(',', '.'));
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const cab = parseInt(f.cabezas, 10), costo = num(f.costo), cam = num(f.camal), kil = num(f.kilos);
    if (!f.fecha || !(cab > 0) || !(costo > 0) || !(cam >= 0) || !(kil > 0)) { setErr('Completa todos los campos con valores válidos (cabezas, costos y kilos mayores a 0).'); return; }
    setErr('');
    setC((p) => { const id = Math.max(0, ...p.compras.map((x) => x.id_compra)) + 1; return {
      compras: [...p.compras, { id_compra: id, fecha_compra: f.fecha, cantidad_cabezas: cab, costo_total_ganado: costo }],
      camal: [...p.camal, { id_camal: Math.max(0, ...p.camal.map((x) => x.id_camal)) + 1, id_compra: id, costo_servicio_camal: cam, kilos_obtencion_total: kil }] }; });
    setF(vacio);
  };
  const campo = (k: keyof typeof f, et: string, type = 'text') => (<label className="text-xs text-neutral-400">{et}<input className="dk-input mt-1" type={type} inputMode={type === 'date' ? undefined : 'decimal'} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>);
  return (
    <>
      <Titulo t="Compras de Ganado y Camal" s="Tablas compra_ganado y proceso_camal" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Cabezas compradas" valor={String(cabezas)} />
        <StatCard titulo="Inversión (ganado + camal)" valor={soles(inversion)} />
        <StatCard titulo="Kilos obtenidos" valor={kg(kilos)} />
        <StatCard titulo="Costo por kilo obtenido" valor={soles(kilos ? inversion / kilos : 0)} />
      </div>
      <form onSubmit={guardar} className="dk-card mt-4"><h2 className="mb-3 font-semibold">Registrar compra y proceso en camal</h2>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">{campo('fecha', 'Fecha de compra', 'date')}{campo('cabezas', 'Cabezas')}{campo('costo', 'Costo total del ganado (S/)')}{campo('camal', 'Costo del servicio de camal (S/)')}{campo('kilos', 'Kilos obtenidos (total)')}</div>
        {err && <p role="alert" className="mt-3 text-sm text-red-400">{err}</p>}
        <button className="dk-btn mt-3">Guardar compra</button></form>
      <section className="dk-card mt-4 overflow-x-auto"><table className="w-full"><thead><tr>{['N.°', 'Fecha', 'Cabezas', 'Costo ganado', 'Costo camal', 'Kilos obtenidos', 'Costo por cabeza', 'Costo por kilo'].map((h) => <th key={h} className="dk-th">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-ink-line">{filas.map(({ c, k }) => (<tr key={c.id_compra}><td className="dk-td">C-{c.id_compra}</td><td className="dk-td">{fechaCorta(c.fecha_compra + 'T12:00:00-05:00')}</td><td className="dk-td">{c.cantidad_cabezas}</td>
          <td className="dk-td">{soles(c.costo_total_ganado)}</td><td className="dk-td">{k ? soles(k.costo_servicio_camal) : '—'}</td><td className="dk-td">{k ? kg(k.kilos_obtencion_total) : '—'}</td>
          <td className="dk-td">{soles(c.costo_total_ganado / c.cantidad_cabezas)}</td><td className="dk-td">{k ? soles((c.costo_total_ganado + k.costo_servicio_camal) / k.kilos_obtencion_total) : '—'}</td></tr>))}</tbody></table></section>
    </>
  );
}
