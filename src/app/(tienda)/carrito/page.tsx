'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthModal } from '@/components/AuthModal';
import { ProductoTile } from '@/components/ProductoTile';
import { locales } from '@/lib/data';
import { kg, soles } from '@/lib/format';
import { useConfig, usePedidos, useStock } from '@/lib/hooks';
import { esMayorista, precioPara, productoPorId, useAuth, useCart } from '@/lib/providers';
import type { MedioPago, TipoEntrega } from '@/lib/types';
import { redondear2 } from '@/lib/validacion';

export default function Carrito() {
  const { abrir } = useAuthModal();
  const { sesion } = useAuth(); const { lineas, cambiar, quitar, vaciar } = useCart();
  const [, setPedidos] = usePedidos(); const [cfg] = useConfig(); const { stockDe, faltante } = useStock();
  const [idLocal, setIdLocal] = useState(1); const [entrega, setEntrega] = useState<TipoEntrega>('Mostrador');
  const [pago, setPago] = useState<MedioPago>('Efectivo'); const [dir, setDir] = useState(''); const [error, setError] = useState('');
  const [hecho, setHecho] = useState('');

  // Precarga la dirección del cliente y respeta lo que el administrador desactivó
  const dirCliente = sesion?.tipo === 'cliente' ? sesion.cliente.direccion ?? '' : '';
  useEffect(() => { if (dirCliente) setDir((d) => d || dirCliente); }, [dirCliente]);
  useEffect(() => {
    if (pago === 'Yape' && !cfg.yape && cfg.efectivo) setPago('Efectivo');
    if (pago === 'Efectivo' && !cfg.efectivo && cfg.yape) setPago('Yape');
  }, [cfg.yape, cfg.efectivo, pago]);
  useEffect(() => { if (!cfg.delivery) setEntrega('Mostrador'); }, [cfg.delivery]);

  const filas = lineas.flatMap((l) => { const p = productoPorId(l.id_producto); return p ? [{ l, p, precio: precioPara(p, sesion) }] : []; });
  const total = redondear2(filas.reduce((s, f) => s + f.l.kg * f.precio, 0));
  const kilos = filas.reduce((s, f) => s + f.l.kg, 0);
  const pagos = (['Efectivo', 'Yape'] as MedioPago[]).filter((m) => (m === 'Yape' ? cfg.yape : cfg.efectivo));

  const pedir = () => {
    setError('');
    if (!cfg.ventaOnline) return setError('La venta en línea está desactivada por ahora. Visítanos en el local.');
    if (!filas.length) return setError('Tu carrito está vacío.');
    if (!pagos.includes(pago)) return setError('Elige un método de pago habilitado.');
    if (entrega === 'Delivery' && !cfg.delivery) return setError('El envío está desactivado por ahora. Elige recojo en tienda.');
    if (filas.some((f) => !(f.l.kg > 0))) return setError('Las cantidades deben ser mayores a 0 kg.');
    const sinStock = faltante(idLocal, filas.map((f) => ({ id_producto: f.p.id_producto, kg: f.l.kg })));
    if (sinStock) return setError(`${sinStock} Reduce la cantidad o elige otro local.`);
    if (entrega === 'Delivery' && dir.trim().length < 5) return setError('Escribe la dirección de entrega (calle, número y referencia).');
    if (!sesion) { abrir('login'); return; } // al iniciar sesión se queda en el carrito
    if (sesion.tipo !== 'cliente') return setError('Para hacer pedidos entra con una cuenta de cliente (el personal registra ventas en el panel operativo).');
    const c = sesion.cliente;
    const id = `PD-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    setPedidos((p) => [{
      id, fecha_hora: new Date().toISOString(), cliente: c.nombre, documento: c.documento, telefono: c.telefono, id_local: idLocal,
      tipo_entrega: entrega, direccion: entrega === 'Delivery' ? dir.trim() : undefined, medio_pago: pago,
      tipo_venta: c.tipo === 'Mayorista' ? 'Por Mayor' : 'Por Menor',
      items: filas.map((f) => ({ id_producto: f.p.id_producto, cantidad_kg: f.l.kg, precio_unitario_kg: f.precio })), total, estado: 'Pendiente',
    }, ...p]);
    vaciar(); setHecho(id);
  };

  if (hecho) return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" role="status">
      <p className="text-5xl" aria-hidden>✅</p><h1 className="mt-3 text-2xl font-bold">¡Pedido registrado!</h1>
      <p className="mt-2 text-neutral-700">Tu pedido <b>{hecho}</b> quedó pendiente. Tiempo máximo de preparación: <b>{cfg.tiempoMax} minutos</b>.</p>
      <Link href="/productos" className="btn-brand mt-6">Seguir comprando</Link>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold"><span aria-hidden>🛒</span> Tu Carrito de Compras</h1>
        {!cfg.ventaOnline && <p role="status" className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-900">La venta en línea está desactivada temporalmente. Puedes visitarnos en cualquiera de nuestros locales.</p>}
        {filas.length === 0 ? (<p className="py-10 text-center text-neutral-600">Tu carrito está vacío. <Link className="font-semibold text-brand underline" href="/productos">Ver productos</Link></p>) : (<>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Productos en tu carrito</caption>
              <thead className="bg-neutral-100 text-left"><tr>
                <th scope="col" className="p-3">Producto</th><th scope="col" className="p-3">Cantidad</th><th scope="col" className="p-3">Precio</th>
                <th scope="col" className="p-3">Subtotal</th><th scope="col"><span className="sr-only">Eliminar</span></th></tr></thead>
              <tbody>{filas.map(({ l, p, precio }) => {
                const disp = stockDe(idLocal, p.id_producto);
                return (
                  <tr key={p.id_producto} className="border-b">
                    <td className="p-3"><div className="flex items-center gap-3"><div className="w-16 shrink-0"><ProductoTile p={p} className="h-12 !rounded-lg" etiqueta={false} /></div><b>{p.nombre_corte}</b></div></td>
                    <td className="p-3">
                      <div className="inline-flex items-center rounded-lg border border-neutral-300">
                        <button type="button" className="px-3 py-1 disabled:opacity-40" aria-label={`Quitar 0.5 kg de ${p.nombre_corte}`} disabled={l.kg <= 0.5} onClick={() => cambiar(p.id_producto, l.kg - 0.5)}>−</button>
                        <span className="w-16 text-center" aria-live="polite">{kg(l.kg)}</span>
                        <button type="button" className="px-3 py-1" aria-label={`Agregar 0.5 kg de ${p.nombre_corte}`} onClick={() => cambiar(p.id_producto, l.kg + 0.5)}>+</button>
                      </div>
                      {l.kg > disp && <p className="mt-1 text-xs text-red-700">Solo hay {kg(Math.max(0, disp))} en este local</p>}
                    </td>
                    <td className="p-3 whitespace-nowrap">{soles(precio)} <span className="text-xs text-neutral-600">/ kg</span></td>
                    <td className="p-3 font-semibold whitespace-nowrap">{soles(l.kg * precio)}</td>
                    <td className="p-3"><button type="button" aria-label={`Eliminar ${p.nombre_corte} del carrito`} className="rounded p-1 text-brand hover:bg-brand-light" onClick={() => quitar(p.id_producto)}><span aria-hidden>🗑</span></button></td>
                  </tr>);
              })}</tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">Local de atención
              <select className="input mt-1 font-normal" value={idLocal} onChange={(e) => setIdLocal(+e.target.value)}>{locales.map((l) => <option key={l.id_local} value={l.id_local}>{l.nombre_local}</option>)}</select></label>
            <label className="text-sm font-semibold">Modalidad de entrega
              <select className="input mt-1 font-normal" value={entrega} onChange={(e) => setEntrega(e.target.value as TipoEntrega)}>
                <option value="Mostrador">Recojo en tienda</option>{cfg.delivery && <option value="Delivery">Envío a domicilio (Delivery)</option>}</select></label>
            <fieldset className="text-sm font-semibold"><legend>Método de pago</legend>
              <div className="mt-2 flex gap-4 font-normal">{pagos.length === 0 ? <span className="text-red-700">Sin medios de pago habilitados</span> : pagos.map((m) => (
                <label key={m} className="flex items-center gap-1"><input type="radio" name="pago" checked={pago === m} onChange={() => setPago(m)} className="accent-[#C0120C]" />{m}</label>))}</div>
            </fieldset>
          </div>
          {entrega === 'Delivery' && <label className="mt-4 block text-sm font-semibold">Dirección de entrega (Andahuaylas)
            <input className="input mt-1 font-normal" value={dir} onChange={(e) => setDir(e.target.value)} placeholder="Calle, número y referencia" autoComplete="street-address" /></label>}
          {entrega === 'Mostrador' && <p className="mt-3 text-xs text-neutral-600">Recoges en: {locales.find((l) => l.id_local === idLocal)?.direccion}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link href="/productos" className="btn-ghost">← Seguir comprando</Link>
            <button type="button" className="btn-brand" onClick={pedir} disabled={!cfg.ventaOnline}>Realizar Pedido</button>
          </div>
        </>)}
        {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>
      <aside className="h-fit overflow-hidden rounded-xl bg-white shadow-card" aria-labelledby="resumen">
        <h2 id="resumen" className="bg-brand px-5 py-3 text-lg font-bold text-white">Resumen del Pedido</h2>
        <dl className="space-y-2 bg-brand-light/60 p-5 text-sm">
          <div className="flex justify-between"><dt>Subtotal ({filas.length} {filas.length === 1 ? 'producto' : 'productos'})</dt><dd>{soles(total)}</dd></div>
          <div className="flex justify-between"><dt>Peso total</dt><dd>{kg(kilos)}</dd></div>
          <div className="flex justify-between"><dt>{entrega === 'Delivery' ? 'Envío local' : 'Recojo en tienda'}</dt><dd>{soles(0)}</dd></div>
          <div className="flex justify-between border-t border-neutral-300 pt-3 text-lg font-bold"><dt>Total</dt><dd className="text-brand">{soles(total)}</dd></div>
        </dl>
        <div className="space-y-1 px-5 pb-5 text-xs text-neutral-700">
          <p>{esMayorista(sesion) ? 'Precios por mayor aplicados (cuenta de negocio).' : 'Precios por menor. Los negocios con RUC acceden al precio por mayor.'}</p>
          <p>Pago: {pago} · {locales.find((l) => l.id_local === idLocal)?.nombre_local}</p>
          {!sesion && <p>Para confirmar el pedido te pediremos <button type="button" onClick={() => abrir('login')} className="font-semibold text-brand underline">iniciar sesión</button>.</p>}
        </div>
      </aside>
    </div>
  );
}
