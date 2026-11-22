// Cliente de la futura API Express (aún NO se usa: el frontend funciona con localStorage).
// Para conectar el backend: define NEXT_PUBLIC_API_URL y cambia el cuerpo de cada hook de
// src/lib/hooks.tsx (y entrar/registrar de providers.tsx) por estas llamadas.
import type {
  CompraGanado, DetalleVenta, Local, ProcesoCamal, Producto, Rol, StockInventario, Trabajador, Venta,
} from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let token: string | null = null; // JWT devuelto por /api/auth/login
export const setToken = (t: string | null) => { token = t; };

async function pedir<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => null)) as { mensaje?: string } | null;
    throw new ApiError(res.status, cuerpo?.mensaje ?? `Error ${res.status}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
const json = (body: unknown) => JSON.stringify(body);

export const api = {
  // Autenticación (JWT + bcrypt en el servidor)
  login: (usuario: string, clave: string) =>
    pedir<{ token: string; trabajador: Trabajador }>('/api/auth/login', { method: 'POST', body: json({ usuario, clave }) }),

  // Catálogo e inventario
  locales: () => pedir<Local[]>('/api/locales'),
  productos: () => pedir<Producto[]>('/api/productos'),
  stock: (id_local?: number) => pedir<StockInventario[]>(`/api/stock${id_local ? `?id_local=${id_local}` : ''}`),
  ajustarStock: (id_stock: number, kilos: number) =>
    pedir<StockInventario>(`/api/stock/${id_stock}`, { method: 'PATCH', body: json({ kilos }) }),

  // Ventas (venta + detalle_venta en una transacción que también descuenta stock_inventario)
  ventas: (q: { desde?: string; hasta?: string; id_local?: number; tipo_venta?: string } = {}) =>
    pedir<{ ventas: Venta[]; detalles: DetalleVenta[] }>(`/api/ventas?${new URLSearchParams(q as Record<string, string>)}`),
  registrarVenta: (venta: Omit<Venta, 'id_venta' | 'fecha_hora'>, detalles: Omit<DetalleVenta, 'id_detalle' | 'id_venta'>[]) =>
    pedir<Venta>('/api/ventas', { method: 'POST', body: json({ venta, detalles }) }),

  // Compras de ganado y camal
  compras: () => pedir<{ compras: CompraGanado[]; camal: ProcesoCamal[] }>('/api/compras'),
  registrarCompra: (compra: Omit<CompraGanado, 'id_compra'>, camal: Omit<ProcesoCamal, 'id_camal' | 'id_compra'>) =>
    pedir<{ compra: CompraGanado; camal: ProcesoCamal }>('/api/compras', { method: 'POST', body: json({ compra, camal }) }),

  // Usuarios (solo administrador)
  trabajadores: () => pedir<Trabajador[]>('/api/trabajadores'),
  crearTrabajador: (t: Omit<Trabajador, 'id_trabajador'> & { clave: string; rol: Rol }) =>
    pedir<Trabajador>('/api/trabajadores', { method: 'POST', body: json(t) }),
};
