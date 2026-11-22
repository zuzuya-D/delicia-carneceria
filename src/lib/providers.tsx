'use client';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { hashClave } from './crypto';
import { CLAVE_DEMO, HASH_DEMO, productos } from './data';
import { useClientes, useTrabajadores } from './hooks';
import { RUTA_INICIO } from './permissions';
import { usePersisted } from './storage';
import type { Cliente, Producto, Trabajador } from './types';
import { soloDigitos, validarClave, validarCorreo, validarDni, validarRuc, validarTelefono } from './validacion';

/* ------------------------------ Sesión (demo) ------------------------------
   Sin backend: trabajadores entran con su usuario y clientes con su correo o
   DNI/RUC. En la etapa de backend esto pasa a POST /api/auth/login (JWT + bcrypt)
   y la sesión guardará solo el token. */
export type Sesion = { tipo: 'trabajador'; trabajador: Trabajador } | { tipo: 'cliente'; cliente: Cliente } | null;

export interface DatosRegistro extends Cliente { clave: string; clave2: string }
type Resultado = { error: string } | { ruta: string };

interface AuthCtx {
  sesion: Sesion; listo: boolean;
  entrar: (identificador: string, clave: string) => Promise<Resultado>;
  registrar: (d: DatosRegistro) => Promise<Resultado>;
  salir: () => void;
}
const Auth = createContext<AuthCtx | null>(null);
export const useAuth = () => { const c = useContext(Auth); if (!c) throw new Error('Falta <Providers>'); return c; };

/** Quita el password_hash antes de guardar la sesión. */
function sinHash<T extends { password_hash: string }>(x: T): Omit<T, 'password_hash'> {
  const { password_hash: _omitido, ...resto } = x; // eslint-disable-line @typescript-eslint/no-unused-vars
  return resto;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion, listo] = usePersisted<Sesion>('delicias.sesion', null);
  const [clientes, setClientes] = useClientes();
  const [trabajadores] = useTrabajadores();
  const [carrito, setCarrito] = usePersisted<LineaCarrito[]>('delicias.carrito', []);

  const entrar = useCallback(async (id: string, clave: string): Promise<Resultado> => {
    const ident = id.trim().toLowerCase();
    if (!ident || !clave) return { error: 'Ingresa tu correo, DNI/RUC o usuario, y tu contraseña.' };
    const hash = await hashClave(clave);
    const t = trabajadores.find((x) => x.usuario.toLowerCase() === ident);
    if (t) {
      const ok = hash === t.password_hash || (t.password_hash === HASH_DEMO && clave === CLAVE_DEMO);
      if (!ok) return { error: 'Usuario o contraseña incorrectos.' };
      setSesion({ tipo: 'trabajador', trabajador: sinHash(t) });
      return { ruta: RUTA_INICIO[t.rol] };
    }
    const c = clientes.find((x) => x.correo.toLowerCase() === ident || x.documento === soloDigitos(ident));
    if (!c || c.password_hash !== hash) return { error: 'Correo/documento o contraseña incorrectos. Si no tienes cuenta, regístrate.' };
    setSesion({ tipo: 'cliente', cliente: sinHash(c) });
    return { ruta: '/' };
  }, [clientes, trabajadores, setSesion]);

  const registrar = useCallback(async (d: DatosRegistro): Promise<Resultado> => {
    const doc = soloDigitos(d.documento);
    const error =
      (!d.nombre.trim() ? (d.tipo === 'Minorista' ? 'Ingresa tu nombre completo.' : 'Ingresa la razón social del negocio.') : null) ??
      (d.tipo === 'Minorista' ? validarDni(doc) : validarRuc(doc)) ??
      validarCorreo(d.correo) ??
      validarTelefono(d.telefono) ??
      validarClave(d.clave) ??
      (d.clave !== d.clave2 ? 'Las contraseñas no coinciden.' : null) ??
      (clientes.some((x) => x.documento === doc) ? `Ya existe una cuenta con ese ${d.tipo === 'Minorista' ? 'DNI' : 'RUC'}.` : null) ??
      (clientes.some((x) => x.correo.toLowerCase() === d.correo.trim().toLowerCase()) ? 'Ya existe una cuenta con ese correo.' : null);
    if (error) return { error };
    const cliente: Cliente = {
      tipo: d.tipo, nombre: d.nombre.trim(), documento: doc, correo: d.correo.trim().toLowerCase(),
      telefono: soloDigitos(d.telefono), direccion: d.direccion?.trim() || undefined,
    };
    const password_hash = await hashClave(d.clave);
    setClientes((p) => [...p, { ...cliente, password_hash }]);
    setSesion({ tipo: 'cliente', cliente });
    return { ruta: '/' };
  }, [clientes, setClientes, setSesion]);

  const salir = useCallback(() => setSesion(null), [setSesion]);
  const auth = useMemo(() => ({ sesion, listo, entrar, registrar, salir }), [sesion, listo, entrar, registrar, salir]);

  const cart = useMemo<CartCtx>(() => ({
    lineas: carrito,
    agregar: (p, kg = 1) => setCarrito((prev) => {
      const e = prev.find((l) => l.id_producto === p.id_producto);
      return e ? prev.map((l) => (l === e ? { ...l, kg: l.kg + kg } : l)) : [...prev, { id_producto: p.id_producto, kg }];
    }),
    cambiar: (id, kg) => setCarrito((prev) => prev.map((l) => (l.id_producto === id ? { ...l, kg: Math.max(0.5, Math.round(kg * 2) / 2) } : l))),
    quitar: (id) => setCarrito((prev) => prev.filter((l) => l.id_producto !== id)),
    vaciar: () => setCarrito([]),
  }), [carrito, setCarrito]);

  return <Auth.Provider value={auth}><Cart.Provider value={cart}>{children}</Cart.Provider></Auth.Provider>;
}

/* -------------------------------- Carrito -------------------------------- */
export interface LineaCarrito { id_producto: number; kg: number }
interface CartCtx {
  lineas: LineaCarrito[];
  agregar: (p: Producto, kg?: number) => void;
  cambiar: (id: number, kg: number) => void;
  quitar: (id: number) => void;
  vaciar: () => void;
}
const Cart = createContext<CartCtx | null>(null);
export const useCart = () => { const c = useContext(Cart); if (!c) throw new Error('Falta <Providers>'); return c; };

/** Precio según el tipo de cliente: mayorista usa precio_mayor_kg, el resto precio_menor_kg. */
export const esMayorista = (sesion: Sesion) => sesion?.tipo === 'cliente' && sesion.cliente.tipo === 'Mayorista';
export const precioPara = (p: Producto, sesion: Sesion) => (esMayorista(sesion) ? p.precio_mayor_kg : p.precio_menor_kg);
export const productoPorId = (id: number) => productos.find((p) => p.id_producto === id);
