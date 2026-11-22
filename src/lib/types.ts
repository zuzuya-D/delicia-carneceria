// Tipos que reflejan 1:1 las tablas de la base de datos PostgreSQL (database/schema.sql)

export type Rol = 'administrador' | 'vendedor' | 'operario';
export type MedioPago = 'Efectivo' | 'Yape';
export type TipoEntrega = 'Mostrador' | 'Delivery';
export type TipoVenta = 'Por Mayor' | 'Por Menor';

export interface Local { id_local: number; nombre_local: string; direccion: string }
/** Trabajador tal como lo devolverá la API (sin password_hash). */
export interface Trabajador {
  id_trabajador: string; id_local: number; nombres: string; telefono: string; usuario: string; rol: Rol;
}
/** Fila completa de la tabla trabajador (solo se usa en el modo demostración). */
export interface TrabajadorFila extends Trabajador { password_hash: string }
export interface Producto {
  id_producto: number; nombre_corte: string; categoria: string; precio_mayor_kg: number; precio_menor_kg: number;
}
export interface StockInventario { id_stock: number; id_local: number; id_producto: number; stock_kilos: number }
export interface CompraGanado { id_compra: number; fecha_compra: string; cantidad_cabezas: number; costo_total_ganado: number }
export interface ProcesoCamal { id_camal: number; id_compra: number; costo_servicio_camal: number; kilos_obtencion_total: number }
export interface Venta {
  id_venta: number; id_local: number; id_trabajador: string; fecha_hora: string;
  medio_pago: MedioPago; tipo_entrega: TipoEntrega; tipo_venta: TipoVenta; total_pagado: number;
}
export interface DetalleVenta {
  id_detalle: number; id_venta: number; id_producto: number; cantidad_kg: number; precio_unitario_kg: number;
}

// --- Tipos solo de la interfaz (aún sin tabla; se definen cuando exista el backend) ---
export type EstadoPedido = 'Pendiente' | 'En preparación' | 'Enviado' | 'Entregado';
export interface ItemPedido { id_producto: number; cantidad_kg: number; precio_unitario_kg: number }
export interface PedidoWeb {
  id: string; fecha_hora: string; cliente: string; documento: string; telefono: string;
  id_local: number; tipo_entrega: TipoEntrega; direccion?: string; medio_pago: MedioPago;
  tipo_venta: TipoVenta; items: ItemPedido[]; total: number; estado: EstadoPedido;
  /** venta creada al entregar el pedido (venta + detalle_venta). */
  id_venta?: number;
  /** true cuando el stock del local ya se descontó (al iniciar la preparación). */
  stock_descontado?: boolean;
}
export interface Cliente {
  tipo: 'Minorista' | 'Mayorista'; nombre: string; documento: string; correo: string; telefono: string; direccion?: string;
}
/** Cliente con su contraseña (hash) para el modo demostración; en el backend será bcrypt. */
export interface ClienteCuenta extends Cliente { password_hash: string }
