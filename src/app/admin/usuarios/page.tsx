'use client';
import { useState } from 'react';
import { Titulo } from '@/components/Shell';
import { hashClave } from '@/lib/crypto';
import { locales } from '@/lib/data';
import { useTrabajadores } from '@/lib/hooks';
import { MODULOS, PERMISOS, type Modulo } from '@/lib/permissions';
import type { Rol } from '@/lib/types';
import { soloDigitos, validarClave, validarTelefono } from '@/lib/validacion';

const ROLES: Rol[] = ['administrador', 'vendedor', 'operario'];
const NOMBRE_MODULO: Record<Modulo, string> = { panel: 'Panel de control', ventas: 'Ventas', pedidos: 'Pedidos', inventario: 'Inventario', compras: 'Compras', reportes: 'Reportes', usuarios: 'Usuarios y permisos', configuracion: 'Configuración' };
const VACIO = { nombres: '', telefono: '', usuario: '', clave: '', rol: 'vendedor' as Rol, id_local: 1 };

export default function Usuarios() {
  const [trabajadores, setTrabajadores] = useTrabajadores();
  const [f, setF] = useState(VACIO); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    const usuario = f.usuario.trim().toLowerCase();
    const error =
      (f.nombres.trim().length < 3 ? 'Ingresa los nombres y apellidos del trabajador.' : null) ??
      validarTelefono(f.telefono) ??
      (!/^[a-z0-9._]{3,30}$/.test(usuario) ? 'El usuario debe tener de 3 a 30 caracteres: letras minúsculas, números, punto o guion bajo.' : null) ??
      (trabajadores.some((t) => t.usuario.toLowerCase() === usuario) ? 'Ese usuario ya existe (usuario es UNIQUE).' : null) ??
      validarClave(f.clave);
    if (error) return setMsg({ ok: false, t: error });
    const password_hash = await hashClave(f.clave);
    setTrabajadores((p) => [...p, {
      id_trabajador: crypto.randomUUID?.() ?? `${Date.now().toString(16)}-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`,
      id_local: f.id_local, nombres: f.nombres.trim(), telefono: soloDigitos(f.telefono), usuario, password_hash, rol: f.rol,
    }]);
    setF(VACIO); setMsg({ ok: true, t: `Trabajador "${usuario}" creado. Ya puede iniciar sesión.` });
  };

  return (
    <>
      <Titulo t="Gestión de Usuarios y Permisos" s="Tabla trabajador · en el backend la contraseña se guardará con bcrypt" />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="dk-card overflow-x-auto"><h2 className="mb-2 font-semibold">Trabajadores</h2>
            <table className="w-full"><thead><tr>{['Nombre', 'Usuario', 'Rol', 'Local', 'Teléfono'].map((h) => <th key={h} scope="col" className="dk-th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-ink-line">{trabajadores.map((t) => (<tr key={t.id_trabajador}><td className="dk-td">{t.nombres}</td><td className="dk-td font-mono text-xs">{t.usuario}</td><td className="dk-td capitalize">{t.rol}</td>
                <td className="dk-td">{locales.find((l) => l.id_local === t.id_local)?.nombre_local.split(' - ')[0]}</td><td className="dk-td">{t.telefono}</td></tr>))}</tbody></table></section>
          <form onSubmit={crear} className="dk-card" noValidate><h2 className="mb-3 font-semibold">Nuevo trabajador</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="dk-label">Nombres y apellidos<input className="dk-input mt-1" value={f.nombres} onChange={(e) => setF({ ...f, nombres: e.target.value })} autoComplete="off" /></label>
              <label className="dk-label">Teléfono (9 dígitos)<input className="dk-input mt-1" inputMode="numeric" maxLength={11} value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} /></label>
              <label className="dk-label">Usuario<input className="dk-input mt-1" value={f.usuario} onChange={(e) => setF({ ...f, usuario: e.target.value })} autoComplete="off" /></label>
              <label className="dk-label">Contraseña (mín. 6)<input className="dk-input mt-1" type="password" value={f.clave} onChange={(e) => setF({ ...f, clave: e.target.value })} autoComplete="new-password" /></label>
              <label className="dk-label">Rol<select className="dk-input mt-1" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value as Rol })}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
              <label className="dk-label">Local<select className="dk-input mt-1" value={f.id_local} onChange={(e) => setF({ ...f, id_local: +e.target.value })}>{locales.map((l) => <option key={l.id_local} value={l.id_local}>{l.nombre_local}</option>)}</select></label>
            </div>
            {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.t}</p>}
            <button className="dk-btn mt-3">Crear trabajador</button>
          </form>
        </div>
        <div className="space-y-4">
          <section className="dk-card"><h2 className="mb-2 font-semibold">Resumen de roles</h2>
            {ROLES.map((r) => <div key={r} className="flex justify-between border-b border-ink-line py-2 text-sm last:border-0"><span className="capitalize">{r}</span><span className="text-neutral-300">{trabajadores.filter((t) => t.rol === r).length} usuarios</span></div>)}</section>
          <section className="dk-card"><h2 className="mb-2 font-semibold">Jerarquía de permisos</h2>
            <table className="w-full text-sm"><caption className="sr-only">Módulos permitidos por rol</caption>
              <thead><tr><th scope="col" className="dk-th">Módulo</th>{ROLES.map((r) => <th key={r} scope="col" className="dk-th text-center capitalize" title={r}>{r.slice(0, 5)}.</th>)}</tr></thead>
              <tbody className="divide-y divide-ink-line">{MODULOS.map((m) => (<tr key={m}><th scope="row" className="dk-td text-left font-normal">{NOMBRE_MODULO[m]}</th>{ROLES.map((r) => (
                <td key={r} className="dk-td text-center">{PERMISOS[r].includes(m) ? <><span aria-hidden>✅</span><span className="sr-only">Permitido</span></> : <><span aria-hidden>—</span><span className="sr-only">Sin acceso</span></>}</td>))}</tr>))}</tbody></table>
            <p className="mt-2 text-xs text-neutral-400">Vendedor y operario usan además el Panel Operativo (/operario). La venta rápida requiere el permiso de Ventas.</p></section>
        </div>
      </div>
    </>
  );
}
