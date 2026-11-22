'use client';
import { useState } from 'react';
import { Titulo } from '@/components/Shell';
import { StatCard } from '@/components/StatCard';
import { TablaPedidos } from '@/components/TablaPedidos';
import { locales } from '@/lib/data';
import { useConfig, useFlujoPedidos } from '@/lib/hooks';
import { ESTADOS } from '@/lib/pedidos';
import { useAuth } from '@/lib/providers';
import type { EstadoPedido } from '@/lib/types';

export default function Pedidos() {
  const { sesion } = useAuth(); const t = sesion?.tipo === 'trabajador' ? sesion.trabajador : null;
  const { pedidos, avanzar } = useFlujoPedidos(t); const [cfg] = useConfig();
  const esAdmin = t?.rol === 'administrador';
  // El administrador ve todos los locales; vendedor y operario, solo el suyo
  const [localSel, setLocalSel] = useState(0);
  const local = esAdmin ? localSel : t?.id_local ?? 0;
  const [estado, setEstado] = useState<'' | EstadoPedido>('');
  const delLocal = pedidos.filter((p) => !local || p.id_local === local);
  const lista = delLocal.filter((p) => !estado || p.estado === estado);
  const nombreLocal = locales.find((l) => l.id_local === local)?.nombre_local;
  return (
    <>
      <Titulo t="Gestión de Pedidos" s={`${nombreLocal ?? 'Todos los locales'} · Pendiente → En preparación → Enviado/Entregado · tiempo máximo ${cfg.tiempoMax} min`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ESTADOS.map((e) => <StatCard key={e} titulo={e} valor={String(delLocal.filter((p) => p.estado === e).length)} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {esAdmin && (
          <label className="dk-label">Local<select className="dk-input mt-1 !w-auto" value={localSel} onChange={(e) => setLocalSel(+e.target.value)}>
            <option value={0}>Todos los locales</option>{locales.map((l) => <option key={l.id_local} value={l.id_local}>{l.nombre_local}</option>)}</select></label>)}
        <label className="dk-label">Estado<select className="dk-input mt-1 !w-auto" value={estado} onChange={(e) => setEstado(e.target.value as '' | EstadoPedido)}>
          <option value="">Todos</option>{ESTADOS.map((e) => <option key={e}>{e}</option>)}</select></label>
      </div>
      <section className="dk-card mt-4">
        <TablaPedidos pedidos={lista} avanzar={avanzar} tiempoMax={cfg.tiempoMax} mostrarLocal={!local}
          vacio={pedidos.length ? 'No hay pedidos con ese filtro.' : 'Aún no hay pedidos. Haz uno desde la tienda con una cuenta de cliente y aparecerá aquí.'} />
      </section>
      <p className="mt-3 text-xs text-neutral-400">Al iniciar la preparación se descuenta el stock del local; al marcar entregado se registra la venta (venta + detalle_venta) a nombre del trabajador que lo cierra.</p>
    </>
  );
}
