'use client';
import { useEffect, useState } from 'react';
import { locales, productos } from '@/lib/data';
import { fechaCorta, hora, kg, soles } from '@/lib/format';
import { accionTexto, atrasado, COLOR_ESTADO, minutosDesde, siguienteEstado } from '@/lib/pedidos';
import type { PedidoWeb } from '@/lib/types';
import { Vacio } from './Shell';

/** Tabla de pedidos web compartida por /admin/pedidos y /operario. */
export function TablaPedidos({ pedidos, avanzar, tiempoMax, mostrarLocal = true, vacio }: {
  pedidos: PedidoWeb[]; avanzar: (id: string) => string | null; tiempoMax: number; mostrarLocal?: boolean; vacio: string;
}) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setAhora(Date.now()), 30000); return () => clearInterval(i); }, []);

  const accion = (p: PedidoWeb) => {
    const sig = siguienteEstado(p);
    const err = avanzar(p.id);
    const extra = sig === 'En preparación' ? ' Stock descontado del local.' : sig === 'Entregado' ? ' Venta registrada.' : '';
    setMsg(err ? { ok: false, t: err } : { ok: true, t: `Pedido ${p.id}: ${sig}.${extra}` });
  };

  const cab = ['N.° pedido', 'Fecha', 'Cliente', ...(mostrarLocal ? ['Local'] : []), 'Entrega', 'Detalle', 'Pago', 'Total', 'Estado', 'Acción'];
  return (
    <>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mb-3 rounded p-2 text-sm ${msg.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>{msg.t}</p>}
      {pedidos.length === 0 ? <Vacio>{vacio}</Vacio> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{cab.map((h) => <th key={h} scope="col" className="dk-th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-ink-line">{pedidos.map((p) => {
              const tarde = atrasado(p, tiempoMax, ahora);
              return (
                <tr key={p.id} className={tarde ? 'bg-red-500/5' : undefined}>
                  <td className="dk-td font-mono text-xs">{p.id}</td>
                  <td className="dk-td whitespace-nowrap">{fechaCorta(p.fecha_hora)} {hora(p.fecha_hora)}
                    {tarde && <span className="block text-xs font-semibold text-red-300">Atrasado · {minutosDesde(p.fecha_hora, ahora)} min</span>}</td>
                  <td className="dk-td">{p.cliente}<span className="block text-xs text-neutral-400">{p.documento.length === 11 ? 'RUC' : 'DNI'} {p.documento} · {p.telefono}</span></td>
                  {mostrarLocal && <td className="dk-td">{locales.find((l) => l.id_local === p.id_local)?.nombre_local.split(' - ')[0]}</td>}
                  <td className="dk-td">{p.tipo_entrega === 'Delivery' ? 'Delivery' : 'Recojo'}{p.direccion && <span className="block text-xs text-neutral-400">{p.direccion}</span>}</td>
                  <td className="dk-td text-xs">{p.items.map((i) => `${kg(i.cantidad_kg)} ${productos.find((x) => x.id_producto === i.id_producto)?.nombre_corte ?? ''}`).join(', ')}
                    <span className="block text-neutral-400">{p.tipo_venta}</span></td>
                  <td className="dk-td">{p.medio_pago}</td>
                  <td className="dk-td whitespace-nowrap font-semibold">{soles(p.total)}</td>
                  <td className="dk-td"><span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[p.estado]}`}>{p.estado}</span>
                    {p.id_venta && <span className="block text-xs text-neutral-400">V-{String(p.id_venta).padStart(4, '0')}</span>}</td>
                  <td className="dk-td">{siguienteEstado(p) && (
                    <button type="button" className="dk-btn whitespace-nowrap !py-1 text-xs" onClick={() => accion(p)} aria-label={`${accionTexto(p)} del pedido ${p.id}`}>{accionTexto(p)}</button>)}</td>
                </tr>);
            })}</tbody>
          </table>
        </div>)}
    </>
  );
}
