'use client';
import { BarrasAgrupadas, Dona } from '@/components/Charts';
import { Titulo } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { productos } from '@/lib/data';
import { diaClave, kg, soles } from '@/lib/format';
import { useCompras, useVentas } from '@/lib/hooks';
import { sum, ultimosDias } from '@/lib/stats';

export default function Reportes() {
  const { ventas, detalles } = useVentas(); const [{ compras, camal }] = useCompras();
  const hoy = ventas.map((v) => diaClave(v.fecha_hora)).sort().at(-1)!;
  const dias = ultimosDias(hoy, 28);
  const semanas = [0, 1, 2, 3].map((i) => {
    const set = new Set(dias.slice(i * 7, i * 7 + 7));
    const a = sum(ventas.filter((v) => set.has(diaClave(v.fecha_hora))).map((v) => v.total_pagado));
    const cs = compras.filter((c) => set.has(c.fecha_compra));
    const b = sum(cs.map((c) => c.costo_total_ganado)) + sum(cs.flatMap((c) => camal.filter((k) => k.id_compra === c.id_compra).map((k) => k.costo_servicio_camal)));
    return { etiqueta: `Sem ${i + 1}`, a, b };
  });
  const ing = sum(semanas.map((s) => s.a)), egr = sum(semanas.map((s) => s.b));
  const v28 = ventas.filter((v) => dias.includes(diaClave(v.fecha_hora)));
  const ids = new Set(v28.map((v) => v.id_venta));
  const pagos = ['Efectivo', 'Yape'].map((m) => ({ nombre: m, valor: sum(v28.filter((v) => v.medio_pago === m).map((v) => v.total_pagado)) }));
  const ganado = sum(compras.filter((c) => dias.includes(c.fecha_compra)).map((c) => c.costo_total_ganado));
  const exportar = () => {
    const filas = [['id_venta', 'fecha_hora', 'id_local', 'tipo_venta', 'tipo_entrega', 'medio_pago', 'total_pagado', 'kilos']];
    v28.forEach((v) => filas.push([String(v.id_venta), v.fecha_hora, String(v.id_local), v.tipo_venta, v.tipo_entrega, v.medio_pago, v.total_pagado.toFixed(2), String(sum(detalles.filter((d) => d.id_venta === v.id_venta).map((d) => d.cantidad_kg)))]));
    const url = URL.createObjectURL(new Blob(['﻿' + filas.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `ventas_${hoy}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <>
      <Titulo t="Reportes y Analítica" s="Últimas 4 semanas · el margen es bruto (ingresos menos compra de ganado y camal)" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Ingresos" valor={soles(ing)} tono="ok" />
        <StatCard titulo="Egresos (ganado + camal)" valor={soles(egr)} />
        <StatCard titulo="Margen bruto" valor={ing ? `${(((ing - egr) / ing) * 100).toFixed(1)} %` : '—'} nota={soles(ing - egr)} tono={ing - egr >= 0 ? 'ok' : 'alerta'} />
        <StatCard titulo="Ventas / kilos" valor={`${v28.length} / ${kg(sum(detalles.filter((d) => ids.has(d.id_venta)).map((d) => d.cantidad_kg)))}`} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="dk-card"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Ingresos vs. egresos por semana</h2>
          <span className="flex gap-3 text-xs text-neutral-400"><span><i className="mr-1 inline-block h-2 w-2 bg-red-600" />Ingresos</span><span><i className="mr-1 inline-block h-2 w-2 bg-neutral-400" />Egresos</span></span></div>
          <BarrasAgrupadas grupos={semanas} /></section>
        <div className="space-y-4">
          <section className="dk-card"><h2 className="mb-3 font-semibold">Ventas por medio de pago</h2><Dona partes={pagos} /></section>
          <section className="dk-card"><h2 className="mb-2 font-semibold">Exportar</h2><p className="mb-3 text-xs text-neutral-400">Ventas de las últimas 4 semanas en CSV (abre en Excel).</p><button className="dk-btn w-full" onClick={exportar}>Exportar ventas (CSV)</button></section>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-400">Compra de ganado del periodo: {soles(ganado)} · Productos activos: {productos.length}</p>
    </>
  );
}
