'use client';
// Acceso a datos del frontend. Hoy lee/escribe localStorage; cada hook indica el
// endpoint de la API Express que lo reemplazará (ver src/lib/api.ts).
import { useCallback, useMemo } from 'react';
import { camalInicial, comprasInicial, detallesBase, productos, stockInicial, trabajadores as trabajadoresBase, ventasBase } from './data';
import { kg } from './format';
import { siguienteEstado } from './pedidos';
import { usePersisted } from './storage';
import type {
  ClienteCuenta, CompraGanado, DetalleVenta, PedidoWeb, ProcesoCamal, StockInventario, Trabajador, TrabajadorFila, Venta,
} from './types';
import { redondear2 } from './validacion';

export interface VentaNueva { venta: Venta; detalles: DetalleVenta[] }
type LineaVenta = Omit<DetalleVenta, 'id_detalle' | 'id_venta'>;

/** GET /api/ventas, POST /api/ventas — demo + ventas registradas en el navegador. */
export function useVentas() {
  const [nuevas, setNuevas, listo] = usePersisted<VentaNueva[]>('delicias.ventasNuevas', []);
  const ventas = useMemo(() => [...ventasBase, ...nuevas.map((n) => n.venta)], [nuevas]);
  const detalles = useMemo(() => [...detallesBase, ...nuevas.flatMap((n) => n.detalles)], [nuevas]);
  const registrar = useCallback((v: Omit<Venta, 'id_venta'>, items: LineaVenta[]) => {
    let id = 0;
    setNuevas((prev) => {
      const todas = [...ventasBase, ...prev.map((n) => n.venta)];
      const dets = [...detallesBase, ...prev.flatMap((n) => n.detalles)];
      id = Math.max(0, ...todas.map((x) => x.id_venta)) + 1;
      let idd = Math.max(0, ...dets.map((x) => x.id_detalle)) + 1;
      return [...prev, { venta: { ...v, id_venta: id }, detalles: items.map((i) => ({ ...i, id_detalle: idd++, id_venta: id })) }];
    });
    return id;
  }, [setNuevas]);
  return { ventas, detalles, registrar, listo };
}

/** GET /api/stock, PATCH /api/stock/:id */
export function useStock() {
  const [stock, setStock, listo] = usePersisted<StockInventario[]>('delicias.stock', stockInicial);
  const stockDe = useCallback((id_local: number, id_producto: number) =>
    stock.find((s) => s.id_local === id_local && s.id_producto === id_producto)?.stock_kilos ?? 0, [stock]);
  /** Suma (o resta, con kilos negativos) en un local. */
  const mover = useCallback((id_local: number, cambios: { id_producto: number; kilos: number }[]) =>
    setStock((st) => st.map((s) => {
      if (s.id_local !== id_local) return s;
      const delta = cambios.filter((c) => c.id_producto === s.id_producto).reduce((a, c) => a + c.kilos, 0);
      return delta ? { ...s, stock_kilos: redondear2(s.stock_kilos + delta) } : s;
    })), [setStock]);
  /** Devuelve un mensaje si alguna línea supera el stock del local. */
  const faltante = useCallback((id_local: number, lineas: { id_producto: number; kg: number }[]) => {
    for (const l of lineas) {
      const disp = stockDe(id_local, l.id_producto);
      if (l.kg > disp) {
        const p = productos.find((x) => x.id_producto === l.id_producto);
        return `Stock insuficiente de ${p?.nombre_corte ?? 'producto'}: pides ${kg(l.kg)} y en el local hay ${kg(Math.max(0, disp))}.`;
      }
    }
    return null;
  }, [stockDe]);
  return { stock, setStock, stockDe, mover, faltante, listo };
}

/** GET/POST /api/compras (compra_ganado + proceso_camal) */
export const useCompras = () => usePersisted<{ compras: CompraGanado[]; camal: ProcesoCamal[] }>('delicias.compras', { compras: comprasInicial, camal: camalInicial });

/** GET/POST/PATCH /api/pedidos (tabla pendiente de definir, ver README) */
export const usePedidos = () => usePersisted<PedidoWeb[]>('delicias.pedidos', []);

/** GET/POST /api/trabajadores — incluye password_hash solo en modo demo. */
export const useTrabajadores = () => usePersisted<TrabajadorFila[]>('delicias.trabajadores', trabajadoresBase);

/** POST /api/auth/registro (tabla cliente pendiente, ver README) */
export const useClientes = () => usePersisted<ClienteCuenta[]>('delicias.clientes', []);

/** GET/PUT /api/configuracion (tabla pendiente, ver README) */
export interface Config { ventaOnline: boolean; delivery: boolean; yape: boolean; efectivo: boolean; tiempoMax: number }
export const CONFIG_INICIAL: Config = { ventaOnline: true, delivery: true, yape: true, efectivo: true, tiempoMax: 45 };
export const useConfig = () => usePersisted<Config>('delicias.config', CONFIG_INICIAL);

/**
 * Flujo de estados de un pedido web:
 *  Pendiente → En preparación: verifica y descuenta el stock del local.
 *  → Enviado (solo Delivery) → Entregado: registra la venta y su detalle con el trabajador que lo cierra.
 */
export function useFlujoPedidos(trabajador: Trabajador | null) {
  const [pedidos, setPedidos, listo] = usePedidos();
  const { faltante, mover } = useStock();
  const { registrar } = useVentas();

  const avanzar = useCallback((id: string): string | null => {
    const p = pedidos.find((x) => x.id === id);
    const sig = p && siguienteEstado(p);
    if (!p || !sig) return 'Este pedido ya no puede avanzar.';
    if (!trabajador) return 'Inicia sesión como trabajador.';
    let extra: Partial<PedidoWeb> = {};
    if (sig === 'En preparación' && !p.stock_descontado) {
      const lineas = p.items.map((i) => ({ id_producto: i.id_producto, kg: i.cantidad_kg }));
      const err = faltante(p.id_local, lineas);
      if (err) return `${err} Añade stock en Inventario antes de preparar el pedido.`;
      mover(p.id_local, lineas.map((l) => ({ id_producto: l.id_producto, kilos: -l.kg })));
      extra = { stock_descontado: true };
    }
    if (sig === 'Entregado' && !p.id_venta) {
      const id_venta = registrar({
        id_local: p.id_local, id_trabajador: trabajador.id_trabajador, fecha_hora: new Date().toISOString(),
        medio_pago: p.medio_pago, tipo_entrega: p.tipo_entrega, tipo_venta: p.tipo_venta, total_pagado: redondear2(p.total),
      }, p.items);
      extra = { id_venta };
    }
    setPedidos((ps) => ps.map((x) => (x.id === id ? { ...x, ...extra, estado: sig } : x)));
    return null;
  }, [pedidos, trabajador, faltante, mover, registrar, setPedidos]);

  return { pedidos, avanzar, listo };
}
