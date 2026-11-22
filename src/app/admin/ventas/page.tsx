'use client';
import { useMemo, useState } from 'react';
import { AreaChart, BarraH, Dona } from '@/components/Charts';
import { Titulo, Vacio } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { locales, productos } from '@/lib/data';
import { diaClave, fechaCorta, hora, kg, soles } from '@/lib/format';
import { useTrabajadores, useVentas } from '@/lib/hooks';
import { ingresoPorCategoria, kgPorProducto, sum, ultimosDias, ventasPorDia } from '@/lib/stats';
import type { TipoVenta } from '@/lib/types';

export default function Ventas() {
  const { ventas, detalles } = useVentas(); const [trabajadores] = useTrabajadores();
  const [local, setLocal] = useState(0); const [tipo, setTipo] = useState<'' | TipoVenta>('');
  const hoy = useMemo(() => ventas.map((v) => diaClave(v.fecha_hora)).sort().at(-1)!, [ventas]);
  const dias = useMemo(() => ultimosDias(hoy, 30), [hoy]);
  const sel = useMemo(() => ventas.filter((v) => dias.includes(diaClave(v.fecha_hora)) && (!local || v.id_local === local) && (!tipo || v.tipo_venta === tipo)), [ventas, dias, local, tipo]);
  const ids = useMemo(() => new Set(sel.map((v) => v.id_venta)), [sel]);
  const det = useMemo(() => detalles.filter((d) => ids.has(d.id_venta)), [detalles, ids]);
  const total = sum(sel.map((v) => v.total_pagado)); const kgs = sum(det.map((d) => d.cantidad_kg));
  const top = kgPorProducto(det, productos).slice(0, 5);
  const recientes = [...sel].sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora)).slice(0, 12);
  return (
    <>
      <Titulo t="Análisis Detallado de Ventas" s="Últimos 30 días · datos de demostración" />
      <div className="mb-4 flex flex-wrap gap-3">
        <select aria-label="Local" className="dk-input !w-auto" value={local} onChange={(e) => setLocal(+e.target.value)}><option value={0}>Todos los locales</option>{locales.map((l) => <option key={l.id_local} value={l.id_local}>{l.nombre_local}</option>)}</select>
        <select aria-label="Tipo de venta" className="dk-input !w-auto" value={tipo} onChange={(e) => setTipo(e.target.value as '' | TipoVenta)}><option value="">Por mayor y por menor</option><option>Por Mayor</option><option>Por Menor</option></select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Ventas totales (30 días)" valor={soles(total)} />
        <StatCard titulo="Ventas de hoy" valor={soles(sum(sel.filter((v) => diaClave(v.fecha_hora) === hoy).map((v) => v.total_pagado)))} />
        <StatCard titulo="Ticket promedio" valor={soles(sel.length ? total / sel.length : 0)} />
        <StatCard titulo="Kilos vendidos" valor={kg(kgs)} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="dk-card"><h2 className="mb-2 font-semibold">Ventas por día</h2>
          <AreaChart puntos={ventasPorDia(sel, dias).map((d) => ({ x: d.dia, y: d.total }))} etiquetaX={(x) => x.slice(8)} /></section>
        <div className="space-y-4">
          <section className="dk-card"><h2 className="mb-3 font-semibold">Ventas por categoría</h2><Dona partes={ingresoPorCategoria(det, productos).map((c) => ({ nombre: c.categoria, valor: c.total }))} /></section>
          <section className="dk-card space-y-3"><h2 className="font-semibold">Top 5 productos (kg)</h2>{top.map((t) => <BarraH key={t.producto.id_producto} etiqueta={t.producto.nombre_corte} valor={t.kg} max={top[0]?.kg ?? 1} texto={kg(t.kg)} />)}</section>
        </div>
      </div>
      <section className="dk-card mt-4 overflow-x-auto"><h2 className="mb-2 font-semibold">Ventas recientes</h2>
        {recientes.length === 0 ? <Vacio>Sin ventas para este filtro.</Vacio> : (
          <table className="w-full"><thead><tr>{['N.°', 'Fecha', 'Hora', 'Local', 'Vendedor', 'Tipo', 'Pago', 'Entrega', 'Total'].map((h) => <th key={h} className="dk-th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-ink-line">{recientes.map((v) => (<tr key={v.id_venta}>
              <td className="dk-td">V-{String(v.id_venta).padStart(4, '0')}</td><td className="dk-td">{fechaCorta(v.fecha_hora)}</td><td className="dk-td">{hora(v.fecha_hora)}</td>
              <td className="dk-td">{locales.find((l) => l.id_local === v.id_local)?.nombre_local.split(' - ')[0]}</td><td className="dk-td">{trabajadores.find((t) => t.id_trabajador === v.id_trabajador)?.nombres.split(' ')[0]}</td>
              <td className="dk-td">{v.tipo_venta}</td><td className="dk-td">{v.medio_pago}</td><td className="dk-td">{v.tipo_entrega}</td><td className="dk-td text-right font-semibold">{soles(v.total_pagado)}</td></tr>))}</tbody></table>)}
      </section>
    </>
  );
}
