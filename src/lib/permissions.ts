import type { Rol } from './types';

export const MODULOS = ['panel', 'ventas', 'pedidos', 'inventario', 'compras', 'reportes', 'usuarios', 'configuracion'] as const;
export type Modulo = (typeof MODULOS)[number];

// Qué rol accede a qué módulo del panel (se validará también en el backend con JWT)
export const PERMISOS: Record<Rol, Modulo[]> = {
  administrador: [...MODULOS],
  vendedor: ['ventas', 'pedidos', 'inventario'],
  operario: ['pedidos', 'inventario'],
};
export const puede = (rol: Rol, m: Modulo) => PERMISOS[rol].includes(m);
export const RUTA_INICIO: Record<Rol, string> = { administrador: '/admin', vendedor: '/operario', operario: '/operario' };
