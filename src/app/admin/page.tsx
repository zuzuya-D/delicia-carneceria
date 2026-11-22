'use client';
import Link from 'next/link';
import { AreaChart, BarraH } from '@/components/Charts';
import { Titulo, Vacio } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { locales, productos, STOCK_BAJO_KG } from '@/lib/data';
import { diaClave, diaCorto, kg, soles } from '@/lib/format';
import { usePedidos, useStock, useVentas } from '@/lib/hooks';
import { kgPorProducto, sum, ultimosDias, ventasPorDia } from '@/lib/stats';

export default function Panel() {
  const { ventas, detalles } = useVentas(); const [pedidos] = usePedidos(); const { stock } = useStock();
  const hoy = ventas.map((v) => diaClave(v.fecha_hora)).sort().at(-1)!;
  const semana = ventasPorDia(ventas, ultimosDias(hoy, 7));
  const dias30 = new Set(ultimosDias(hoy, 30));
  const v30 = ventas.filter((v) => dias30.has(diaClave(v.fecha_hora)));
  const hoyTotal = sum(ventas.filter((v) => diaClave(v.fecha_hora) === hoy).map((v) => v.total_pagado));
  const ids30 = new Set(v30.map((v) => v.id_venta));
  const top = kgPorProducto(detalles.filter((d) => ids30.has(d.id_venta)), productos).slice(0, 3);
  const pend = pedidos.filter((p) => p.estado === 'Pendiente' || p.estado === 'En preparación').length;
  const criticos = stock.filter((s) => s.stock_kilos < STOCK_BAJO_KG).sort((a, b) => a.stock_kilos - b.stock_kilos);
  return (
    <>
      <Titulo t="Panel de Control General" s="Resumen de los últimos 30 días (datos de demostración)" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Ventas de hoy" valor={soles(hoyTotal)} nota={`${ventas.filter((v) => diaClave(v.fecha_hora) === hoy).length} ventas`} />
        <StatCard titulo="Pedidos pendientes" valor={String(pend)} nota="web por atender" tono={pend ? 'alerta' : 'ok'} />
        <StatCard titulo="Productos con stock bajo" valor={String(criticos.length)} nota={`menos de ${STOCK_BAJO_KG} kg por local`} tono={criticos.length ? 'alerta' : 'ok'} />
        <StatCard titulo="Ingreso (30 días)" valor={soles(sum(v30.map((v) => v.total_pagado)))} nota={`${v30.length} ventas`} tono="ok" />
      </div>
      <section className="dk-card mt-4"><h2 className="mb-2 font-semibold">Ventas de la semana</h2>
        <AreaChart puntos={semana.map((d) => ({ x: d.dia, y: d.total }))} etiquetaX={(x) => diaCorto(`${x}T12:00:00-05:00`)} /></section>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="dk-card space-y-3"><h2 className="font-semibold">Producto más vendido (kg, 30 días)</h2>
          {top.map((t) => <BarraH key={t.producto.id_producto} etiqueta={t.producto.nombre_corte} valor={t.kg} max={top[0]?.kg ?? 1} texto={kg(t.kg)} />)}</section>
        <section className="dk-card"><h2 className="mb-3 font-semibold">Estado de inventario crítico</h2>
          {criticos.length === 0 ? <Vacio>Sin alertas de stock.</Vacio> : (
            <div className="space-y-3">{criticos.slice(0, 4).map((s) => { const p = productos.find((x) => x.id_producto === s.id_producto)!; const l = locales.find((x) => x.id_local === s.id_local)!;
              return <BarraH key={s.id_stock} alerta etiqueta={`${p.nombre_corte} · ${l.nombre_local.split(' - ')[0]}`} valor={s.stock_kilos} max={STOCK_BAJO_KG} texto={kg(s.stock_kilos)} />; })}</div>)}
          <Link href="/admin/inventario" className="dk-btn-ghost mt-4 w-full">Ver todo el inventario</Link></section>
      </div>
    </>
  );
}
