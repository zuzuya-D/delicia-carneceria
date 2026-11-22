import { diaClave } from './format';
import type { DetalleVenta, Producto, Venta } from './types';

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export function ventasPorDia(ventas: Venta[], dias: string[]) {
  const m = new Map<string, number>();
  ventas.forEach((v) => { const k = diaClave(v.fecha_hora); m.set(k, (m.get(k) ?? 0) + v.total_pagado); });
  return dias.map((d) => ({ dia: d, total: Math.round((m.get(d) ?? 0) * 100) / 100 }));
}

export function ultimosDias(hoy: string, n: number) {
  const t = new Date(`${hoy}T12:00:00-05:00`).getTime();
  return Array.from({ length: n }, (_, i) => diaClave(new Date(t - (n - 1 - i) * 86400000).toISOString()));
}

export function kgPorProducto(detalles: DetalleVenta[], productos: Producto[]) {
  const m = new Map<number, number>();
  detalles.forEach((d) => m.set(d.id_producto, (m.get(d.id_producto) ?? 0) + d.cantidad_kg));
  return productos.map((p) => ({ producto: p, kg: m.get(p.id_producto) ?? 0 })).sort((a, b) => b.kg - a.kg);
}

export function ingresoPorCategoria(detalles: DetalleVenta[], productos: Producto[]) {
  const cat = new Map(productos.map((p) => [p.id_producto, p.categoria]));
  const m = new Map<string, number>();
  detalles.forEach((d) => { const c = cat.get(d.id_producto) ?? 'Otros'; m.set(c, (m.get(c) ?? 0) + d.cantidad_kg * d.precio_unitario_kg); });
  return [...m.entries()].map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total);
}
