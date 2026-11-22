// Datos de demostración con la misma forma que las tablas de PostgreSQL.
// Se reemplazarán por llamadas a la API Express cuando exista el backend.
import type { CompraGanado, DetalleVenta, Local, Producto, ProcesoCamal, StockInventario, TrabajadorFila, Venta } from './types';

export const HOY = '2026-11-21'; // fecha de referencia fija para que los datos de demo sean estables

export const locales: Local[] = [
  { id_local: 1, nombre_local: 'Local 1 - Sede Central', direccion: 'Av. Pedro Reyes 450, Andahuaylas' },
  { id_local: 2, nombre_local: 'Local 2 - Mercado Modelo', direccion: 'Jr. Ayacucho 215 (interior Mercado Modelo), Andahuaylas' },
];

// Clave de demostración de todo el personal: "delicias123" (hash SHA-256 con sal de demo, ver crypto.ts)
export const CLAVE_DEMO = 'delicias123';
export const HASH_DEMO = '7fa34a1f2eb77c704dcb6881690a946b7ba615c2c374a9df68ef1df22b4413f8';

export const trabajadores: TrabajadorFila[] = [
  { id_trabajador: '6f1c2a10-0000-4000-8000-000000000001', id_local: 1, nombres: 'Ana Martínez Quispe', telefono: '987 654 321', usuario: 'admin', rol: 'administrador', password_hash: HASH_DEMO },
  { id_trabajador: '6f1c2a10-0000-4000-8000-000000000002', id_local: 1, nombres: 'Juan Pérez Huamán', telefono: '987 111 222', usuario: 'jperez', rol: 'vendedor', password_hash: HASH_DEMO },
  { id_trabajador: '6f1c2a10-0000-4000-8000-000000000003', id_local: 2, nombres: 'Laura García Ccori', telefono: '987 333 444', usuario: 'lgarcia', rol: 'vendedor', password_hash: HASH_DEMO },
  { id_trabajador: '6f1c2a10-0000-4000-8000-000000000004', id_local: 2, nombres: 'Carlos Ruiz Llamocca', telefono: '987 555 666', usuario: 'cruiz', rol: 'operario', password_hash: HASH_DEMO },
];

export const CATEGORIAS = ['Vacuno', 'Molidos', 'Embutidos', 'Menudencia', 'Preparados'] as const;

// Precios de demostración (menor = precio al público; mayor = precio a negocios)
export const productos: Producto[] = [
  { id_producto: 1, nombre_corte: 'Bistec de Res', categoria: 'Vacuno', precio_mayor_kg: 26, precio_menor_kg: 28 },
  { id_producto: 2, nombre_corte: 'Costilla de Res', categoria: 'Vacuno', precio_mayor_kg: 24, precio_menor_kg: 26 },
  { id_producto: 3, nombre_corte: 'Carne Molida', categoria: 'Molidos', precio_mayor_kg: 22, precio_menor_kg: 24 },
  { id_producto: 4, nombre_corte: 'Salchicha Parrillera', categoria: 'Embutidos', precio_mayor_kg: 18, precio_menor_kg: 20 },
  { id_producto: 5, nombre_corte: 'Corte Único', categoria: 'Vacuno', precio_mayor_kg: 27, precio_menor_kg: 30 },
  { id_producto: 6, nombre_corte: 'Chuleta', categoria: 'Vacuno', precio_mayor_kg: 25, precio_menor_kg: 28 },
  { id_producto: 7, nombre_corte: 'Carne Picada', categoria: 'Molidos', precio_mayor_kg: 23, precio_menor_kg: 25 },
  { id_producto: 8, nombre_corte: 'Osobuco', categoria: 'Vacuno', precio_mayor_kg: 18, precio_menor_kg: 20 },
  { id_producto: 9, nombre_corte: 'Apanados', categoria: 'Preparados', precio_mayor_kg: 30, precio_menor_kg: 34 },
  { id_producto: 10, nombre_corte: 'Rachi', categoria: 'Menudencia', precio_mayor_kg: 14, precio_menor_kg: 16 },
  { id_producto: 11, nombre_corte: 'Corazón', categoria: 'Menudencia', precio_mayor_kg: 13, precio_menor_kg: 15 },
  { id_producto: 12, nombre_corte: 'Lomo Fino', categoria: 'Vacuno', precio_mayor_kg: 38, precio_menor_kg: 42 },
];

// Stock inicial por local (un registro por local y producto, como UNIQUE(id_local, id_producto))
const stockBase: Record<number, [number, number]> = {
  1: [150, 60], 2: [90, 40], 3: [70, 35], 4: [60, 25], 5: [80, 30], 6: [55, 22],
  7: [45, 20], 8: [30, 12], 9: [28, 10], 10: [18, 9], 11: [10, 4], 12: [3, 14],
};
export const stockInicial: StockInventario[] = locales.flatMap((l, li) =>
  productos.map((p, pi) => ({
    id_stock: li * productos.length + pi + 1, id_local: l.id_local, id_producto: p.id_producto,
    stock_kilos: stockBase[p.id_producto][li],
  })),
);
export const STOCK_BAJO_KG = 15;

// Fotos reales: copia public/productos/<id_producto>.jpg y agrega su id aquí.
export const FOTOS_PRODUCTO: number[] = [];

export const comprasInicial: CompraGanado[] = [
  { id_compra: 1, fecha_compra: '2026-10-26', cantidad_cabezas: 4, costo_total_ganado: 6420 },
  { id_compra: 2, fecha_compra: '2026-10-29', cantidad_cabezas: 4, costo_total_ganado: 6500 },
  { id_compra: 3, fecha_compra: '2026-11-02', cantidad_cabezas: 3, costo_total_ganado: 4890 },
  { id_compra: 4, fecha_compra: '2026-11-05', cantidad_cabezas: 4, costo_total_ganado: 6540 },
  { id_compra: 5, fecha_compra: '2026-11-09', cantidad_cabezas: 4, costo_total_ganado: 6480 },
  { id_compra: 6, fecha_compra: '2026-11-12', cantidad_cabezas: 4, costo_total_ganado: 6600 },
  { id_compra: 7, fecha_compra: '2026-11-16', cantidad_cabezas: 3, costo_total_ganado: 4950 },
  { id_compra: 8, fecha_compra: '2026-11-19', cantidad_cabezas: 4, costo_total_ganado: 6560 },
];
export const camalInicial: ProcesoCamal[] = comprasInicial.map((c, i) => ({
  id_camal: i + 1, id_compra: c.id_compra,
  costo_servicio_camal: c.cantidad_cabezas * 88,
  kilos_obtencion_total: Math.round(c.cantidad_cabezas * (158 + (i % 3) * 4)),
}));

// ---- Ventas de demostración (últimos 30 días hasta HOY), generadas con semilla fija ----
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function generarVentas(): { ventas: Venta[]; detalles: DetalleVenta[] } {
  const r = rng(2026);
  const ventas: Venta[] = []; const detalles: DetalleVenta[] = [];
  const base = new Date(`${HOY}T00:00:00-05:00`).getTime();
  const peso = [4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 2]; // popularidad por producto
  const bolsa = peso.flatMap((w, i) => Array(w).fill(i));
  const vendedores = trabajadores.filter((t) => t.rol === 'vendedor'); // solo vendedores registran ventas de mostrador
  let idv = 1, idd = 1;
  for (let d = 29; d >= 0; d--) {
    const fecha = new Date(base - d * 86400000);
    const dow = new Date(fecha.getTime() + 5 * 3600000).getUTCDay(); // 0 dom, 6 sáb
    const n = Math.round((dow === 0 || dow === 6 ? 14 : 8) + r() * 4);
    for (let k = 0; k < n; k++) {
      const trab = vendedores[Math.floor(r() * vendedores.length)];
      const mayor = r() < 0.18;
      const lineas = 1 + Math.floor(r() * 3);
      let total = 0; const usados = new Set<number>();
      const id = idv++;
      for (let j = 0; j < lineas; j++) {
        const p = productos[bolsa[Math.floor(r() * bolsa.length)]];
        if (usados.has(p.id_producto)) continue; usados.add(p.id_producto);
        const cant = mayor ? Math.round((8 + r() * 22) * 2) / 2 : Math.round((0.5 + r() * 3.5) * 2) / 2;
        const precio = mayor ? p.precio_mayor_kg : p.precio_menor_kg;
        total += cant * precio;
        detalles.push({ id_detalle: idd++, id_venta: id, id_producto: p.id_producto, cantidad_kg: cant, precio_unitario_kg: precio });
      }
      const hora = 7 + Math.floor(r() * 11), min = Math.floor(r() * 60);
      ventas.push({
        id_venta: id, id_local: trab.id_local, id_trabajador: trab.id_trabajador,
        fecha_hora: new Date(fecha.getTime() + (hora * 60 + min) * 60000).toISOString(),
        medio_pago: r() < 0.4 ? 'Yape' : 'Efectivo', tipo_entrega: r() < 0.12 ? 'Delivery' : 'Mostrador',
        tipo_venta: mayor ? 'Por Mayor' : 'Por Menor', total_pagado: Math.round(total * 100) / 100,
      });
    }
  }
  return { ventas, detalles };
}
export const { ventas: ventasBase, detalles: detallesBase } = generarVentas();
