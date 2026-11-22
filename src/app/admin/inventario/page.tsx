'use client';
import { useState } from 'react';
import { Titulo } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { CATEGORIAS, locales, productos, STOCK_BAJO_KG } from '@/lib/data';
import { kg, soles } from '@/lib/format';
import { useStock } from '@/lib/hooks';
import { useAuth } from '@/lib/providers';
import { sum } from '@/lib/stats';
import { aNumero, validarKg } from '@/lib/validacion';

type Estado = 'Agotado' | 'Stock bajo' | 'En stock';
const estadoDe = (n: number): Estado => (n <= 0 ? 'Agotado' : n < STOCK_BAJO_KG ? 'Stock bajo' : 'En stock');
const COLOR: Record<Estado, string> = { Agotado: 'bg-red-500/20 text-red-200', 'Stock bajo': 'bg-amber-500/20 text-amber-200', 'En stock': 'bg-emerald-500/20 text-emerald-200' };

export default function Inventario() {
  const { sesion } = useAuth(); const t = sesion?.tipo === 'trabajador' ? sesion.trabajador : null;
  const esAdmin = t?.rol === 'administrador';
  const { stock, mover } = useStock();
  const [localSel, setLocalSel] = useState(t?.id_local ?? 1);
  const idLocal = esAdmin ? localSel : t?.id_local ?? 1; // vendedor y operario: solo su local
  const [filtro, setFiltro] = useState<'' | Estado>(''); const [cat, setCat] = useState('');
  const [add, setAdd] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const todas = productos.flatMap((p) => { const s = stock.find((x) => x.id_local === idLocal && x.id_producto === p.id_producto); return s ? [{ p, s }] : []; });
  const filas = todas.filter(({ p, s }) => (!filtro || estadoDe(s.stock_kilos) === filtro) && (!cat || p.categoria === cat));
  const kilos = todas.map((f) => f.s.stock_kilos);

  const ajustar = (id_producto: number, nombre: string) => {
    const txt = add[id_producto] ?? '';
    const err = validarKg(txt, `Los kilos a añadir de ${nombre}`);
    if (err) return setMsg({ ok: false, t: err });
    const n = aNumero(txt);
    if (n > 2000) return setMsg({ ok: false, t: 'No se pueden añadir más de 2000 kg de una vez. Revisa la cantidad.' });
    mover(idLocal, [{ id_producto, kilos: n }]);
    setAdd((a) => ({ ...a, [id_producto]: '' }));
    setMsg({ ok: true, t: `Se añadieron ${kg(n)} de ${nombre}.` });
  };

  return (
    <>
      <Titulo t="Gestión de Inventario" s={`Existencias por local (tabla stock_inventario) · stock bajo: menos de ${STOCK_BAJO_KG} kg`} />
      <div className="mb-4 flex flex-wrap gap-3">
        {esAdmin ? (
          <label className="dk-label">Local<select className="dk-input mt-1 !w-auto" value={localSel} onChange={(e) => setLocalSel(+e.target.value)}>
            {locales.map((l) => <option key={l.id_local} value={l.id_local}>{l.nombre_local}</option>)}</select></label>
        ) : <p className="self-end rounded-lg bg-ink-3 px-3 py-2 text-sm">{locales.find((l) => l.id_local === idLocal)?.nombre_local}</p>}
        <label className="dk-label">Estado<select className="dk-input mt-1 !w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value as '' | Estado)}>
          <option value="">Todos</option><option>En stock</option><option>Stock bajo</option><option>Agotado</option></select></label>
        <label className="dk-label">Categoría<select className="dk-input mt-1 !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas</option>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard titulo="Valor de existencias (precio por menor)" valor={soles(sum(todas.map((f) => f.s.stock_kilos * f.p.precio_menor_kg)))} />
        <StatCard titulo="Kilos en stock" valor={kg(sum(kilos))} />
        <StatCard titulo="Con stock bajo" valor={String(kilos.filter((k) => k > 0 && k < STOCK_BAJO_KG).length)} tono="alerta" nota={`menos de ${STOCK_BAJO_KG} kg`} />
        <StatCard titulo="Agotados" valor={String(kilos.filter((k) => k <= 0).length)} tono="alerta" />
      </div>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-4 rounded p-2 text-sm ${msg.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>{msg.t}</p>}
      <section className="dk-card mt-4 overflow-x-auto">
        <table className="w-full"><caption className="sr-only">Inventario del local</caption>
          <thead><tr>{['Producto', 'Categoría', 'Stock disponible', 'Estado', 'Añadir stock (kg)'].map((h) => <th key={h} scope="col" className="dk-th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-line">{filas.map(({ p, s }) => { const e = estadoDe(s.stock_kilos); return (
            <tr key={p.id_producto}>
              <td className="dk-td font-medium">{p.nombre_corte}</td><td className="dk-td">{p.categoria}</td>
              <td className="dk-td"><div className="flex items-center gap-2"><div className="h-2 w-28 rounded bg-ink-3" aria-hidden><div className={`h-2 rounded ${e === 'En stock' ? 'bg-emerald-500' : e === 'Stock bajo' ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (Math.max(0, s.stock_kilos) / 150) * 100)}%` }} /></div>{kg(s.stock_kilos)}</div></td>
              <td className="dk-td"><span className={`rounded px-2 py-0.5 text-xs font-medium ${COLOR[e]}`}>{e}</span></td>
              <td className="dk-td"><form className="flex gap-2" onSubmit={(ev) => { ev.preventDefault(); ajustar(p.id_producto, p.nombre_corte); }}>
                <input inputMode="decimal" aria-label={`Kilos a añadir de ${p.nombre_corte}`} className="dk-input !w-24" placeholder="0" value={add[p.id_producto] ?? ''} onChange={(ev) => setAdd({ ...add, [p.id_producto]: ev.target.value })} />
                <button type="submit" className="dk-btn-ghost whitespace-nowrap">+ Añadir</button></form></td>
            </tr>); })}
            {filas.length === 0 && <tr><td colSpan={5} className="dk-td py-6 text-center text-neutral-400">Sin productos para este filtro.</td></tr>}
          </tbody></table>
      </section>
    </>
  );
}
