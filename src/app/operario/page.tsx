'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Titulo, Vacio } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { TablaPedidos } from '@/components/TablaPedidos';
import { locales, productos, STOCK_BAJO_KG } from '@/lib/data';
import { diaClave, kg, soles } from '@/lib/format';
import { useConfig, useFlujoPedidos, useStock, useVentas } from '@/lib/hooks';
import { atrasado } from '@/lib/pedidos';
import { puede } from '@/lib/permissions';
import { useAuth } from '@/lib/providers';
import { sum } from '@/lib/stats';
import type { MedioPago, TipoEntrega, TipoVenta } from '@/lib/types';
import { aNumero, redondear2, validarKg } from '@/lib/validacion';

interface Linea { id_producto: number; kg: number }

export default function Operativo() {
  const { sesion } = useAuth(); const t = sesion?.tipo === 'trabajador' ? sesion.trabajador : null;
  const { ventas, registrar } = useVentas(); const { pedidos, avanzar } = useFlujoPedidos(t);
  const { stockDe, mover, faltante } = useStock(); const [cfg] = useConfig();
  const [lineas, setLineas] = useState<Linea[]>([]); const [prod, setProd] = useState(productos[0].id_producto); const [cant, setCant] = useState('1');
  const [pago, setPago] = useState<MedioPago>('Efectivo'); const [tipo, setTipo] = useState<TipoVenta>('Por Menor');
  const [entrega, setEntrega] = useState<TipoEntrega>('Mostrador');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  if (!t) return null;

  const vende = puede(t.rol, 'ventas');
  const local = locales.find((l) => l.id_local === t.id_local)!;
  const stockLocal = (id: number) => stockDe(t.id_local, id);
  const precio = (id: number) => { const p = productos.find((x) => x.id_producto === id)!; return tipo === 'Por Mayor' ? p.precio_mayor_kg : p.precio_menor_kg; };
  const total = redondear2(sum(lineas.map((l) => l.kg * precio(l.id_producto))));
  const hoy = diaClave(new Date().toISOString());
  const mias = ventas.filter((v) => v.id_trabajador === t.id_trabajador && diaClave(v.fecha_hora) === hoy);
  const cola = pedidos.filter((p) => p.id_local === t.id_local && p.estado !== 'Entregado');
  const tarde = cola.filter((p) => atrasado(p, cfg.tiempoMax)).length;
  const criticos = productos.map((p) => ({ p, s: stockLocal(p.id_producto) })).filter((x) => x.s < STOCK_BAJO_KG).sort((a, b) => a.s - b.s);

  const agregar = () => {
    const e = validarKg(cant, 'La cantidad');
    if (e) return setMsg({ ok: false, t: e });
    const n = aNumero(cant);
    const ya = lineas.find((l) => l.id_producto === prod)?.kg ?? 0;
    const err = faltante(t.id_local, [{ id_producto: prod, kg: ya + n }]);
    if (err) return setMsg({ ok: false, t: err });
    setMsg(null); setCant('1');
    setLineas((ls) => (ls.some((l) => l.id_producto === prod) ? ls.map((l) => (l.id_producto === prod ? { ...l, kg: redondear2(l.kg + n) } : l)) : [...ls, { id_producto: prod, kg: n }]));
  };
  const cobrar = () => {
    if (!lineas.length) return setMsg({ ok: false, t: 'Agrega al menos un producto.' });
    const err = faltante(t.id_local, lineas); // el stock pudo cambiar mientras tanto
    if (err) return setMsg({ ok: false, t: err });
    const id = registrar({ id_local: t.id_local, id_trabajador: t.id_trabajador, fecha_hora: new Date().toISOString(), medio_pago: pago, tipo_entrega: entrega, tipo_venta: tipo, total_pagado: total },
      lineas.map((l) => ({ id_producto: l.id_producto, cantidad_kg: l.kg, precio_unitario_kg: precio(l.id_producto) })));
    mover(t.id_local, lineas.map((l) => ({ id_producto: l.id_producto, kilos: -l.kg })));
    setMsg({ ok: true, t: `Venta V-${String(id).padStart(4, '0')} registrada por ${soles(total)}. Stock actualizado.` }); setLineas([]);
  };

  return (
    <>
      <Titulo t="Panel Operativo del Empleado" s={`Bienvenido, ${t.nombres.split(' ')[0]} · ${local.nombre_local} · rol ${t.rol}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        {vende
          ? <StatCard titulo="Mis ventas de hoy" valor={String(mias.length)} nota={soles(sum(mias.map((v) => v.total_pagado)))} tono="ok" />
          : <StatCard titulo="Pedidos atrasados" valor={String(tarde)} nota={`más de ${cfg.tiempoMax} min`} tono={tarde ? 'alerta' : 'ok'} />}
        <StatCard titulo="Pedidos en cola (mi local)" valor={String(cola.length)} nota={tarde ? `${tarde} atrasados` : 'al día'} tono={tarde ? 'alerta' : 'neutral'} />
        <StatCard titulo="Alertas de stock" valor={String(criticos.length)} tono={criticos.length ? 'alerta' : 'ok'} nota={`menos de ${STOCK_BAJO_KG} kg`} />
      </div>

      <section className="dk-card mt-4" aria-labelledby="t-cola"><h2 id="t-cola" className="mb-2 font-semibold">Pedidos en cola de preparación</h2>
        <TablaPedidos pedidos={cola} avanzar={avanzar} tiempoMax={cfg.tiempoMax} mostrarLocal={false} vacio="No hay pedidos pendientes en este local." />
      </section>

      <div className={`mt-4 grid gap-4 ${vende ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        {vende && (
          <section className="dk-card" aria-labelledby="t-pos"><h2 id="t-pos" className="mb-3 font-semibold">Registro de venta rápida (punto de venta)</h2>
            <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); agregar(); }}>
              <label className="dk-label">Producto<select className="dk-input mt-1" value={prod} onChange={(e) => setProd(+e.target.value)}>
                {productos.map((p) => <option key={p.id_producto} value={p.id_producto} disabled={stockLocal(p.id_producto) <= 0}>{p.nombre_corte} ({kg(stockLocal(p.id_producto))})</option>)}</select></label>
              <label className="dk-label">Cantidad (kg)<input inputMode="decimal" className="dk-input mt-1 !w-24" value={cant} onChange={(e) => setCant(e.target.value)} /></label>
              <button type="submit" className="dk-btn-ghost">+ Agregar</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">Tipo<select className="dk-input !w-auto" value={tipo} onChange={(e) => setTipo(e.target.value as TipoVenta)}><option>Por Menor</option><option>Por Mayor</option></select></label>
              <label className="flex items-center gap-2">Pago<select className="dk-input !w-auto" value={pago} onChange={(e) => setPago(e.target.value as MedioPago)}><option>Efectivo</option><option>Yape</option></select></label>
              <label className="flex items-center gap-2">Entrega<select className="dk-input !w-auto" value={entrega} onChange={(e) => setEntrega(e.target.value as TipoEntrega)}><option>Mostrador</option><option>Delivery</option></select></label>
            </div>
            {lineas.length > 0 && (
              <table className="mt-3 w-full"><caption className="sr-only">Productos de la venta</caption>
                <tbody className="divide-y divide-ink-line">{lineas.map((l) => { const n = productos.find((p) => p.id_producto === l.id_producto)?.nombre_corte; return (
                  <tr key={l.id_producto}><td className="dk-td">{n}</td><td className="dk-td">{kg(l.kg)} × {soles(precio(l.id_producto))}</td><td className="dk-td text-right">{soles(l.kg * precio(l.id_producto))}</td>
                    <td className="dk-td"><button type="button" aria-label={`Quitar ${n} de la venta`} className="rounded px-1 text-red-300" onClick={() => setLineas((ls) => ls.filter((x) => x !== l))}><span aria-hidden>✕</span></button></td></tr>); })}</tbody></table>)}
            <div className="mt-3 flex items-center justify-between"><p className="text-lg font-bold">Total {soles(total)}</p><button type="button" className="dk-btn" disabled={!lineas.length} onClick={cobrar}>Cobrar y registrar</button></div>
            {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-2 text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.t}</p>}
          </section>)}
        <section className="dk-card" aria-labelledby="t-crit"><h2 id="t-crit" className="mb-2 font-semibold">Alertas de stock crítico en el local</h2>
          {criticos.length === 0 ? <Vacio>Sin alertas.</Vacio> : (
            <ul className="space-y-2 text-sm">{criticos.map(({ p, s }) => <li key={p.id_producto} className="flex justify-between"><span>{p.nombre_corte}</span><span className={s <= 0 ? 'font-semibold text-red-300' : 'text-amber-200'}>{s <= 0 ? 'Agotado' : kg(s)}</span></li>)}</ul>)}
          <Link href="/admin/inventario" className="dk-btn-ghost mt-4 w-full">Ir a Inventario</Link>
        </section>
      </div>
    </>
  );
}
