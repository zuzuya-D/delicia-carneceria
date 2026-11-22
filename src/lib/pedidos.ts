import type { EstadoPedido, PedidoWeb } from './types';

export const ESTADOS: EstadoPedido[] = ['Pendiente', 'En preparación', 'Enviado', 'Entregado'];

export const siguienteEstado = (p: PedidoWeb): EstadoPedido | null => {
  if (p.estado === 'Pendiente') return 'En preparación';
  if (p.estado === 'En preparación') return p.tipo_entrega === 'Delivery' ? 'Enviado' : 'Entregado';
  if (p.estado === 'Enviado') return 'Entregado';
  return null;
};
export const accionTexto = (p: PedidoWeb) => {
  const s = siguienteEstado(p);
  return s === 'En preparación' ? 'Iniciar preparación' : s === 'Enviado' ? 'Marcar enviado' : s === 'Entregado' ? 'Marcar entregado' : '';
};
export const COLOR_ESTADO: Record<EstadoPedido, string> = {
  Pendiente: 'bg-yellow-500/20 text-yellow-200', 'En preparación': 'bg-amber-500/20 text-amber-200',
  Enviado: 'bg-sky-500/20 text-sky-200', Entregado: 'bg-emerald-500/20 text-emerald-200',
};
/** Minutos desde que se hizo el pedido. */
export const minutosDesde = (iso: string, ahora = Date.now()) => Math.floor((ahora - new Date(iso).getTime()) / 60000);
/** Atrasado: sigue pendiente o en preparación y superó el tiempo máximo de preparación. */
export const atrasado = (p: PedidoWeb, tiempoMax: number, ahora?: number) =>
  (p.estado === 'Pendiente' || p.estado === 'En preparación') && minutosDesde(p.fecha_hora, ahora) > tiempoMax;
