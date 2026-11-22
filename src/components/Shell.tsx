'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { puede, RUTA_INICIO, type Modulo } from '@/lib/permissions';
import { useAuth } from '@/lib/providers';
import { Logo } from './Logo';

const ITEMS: { href: string; texto: string; icono: string; modulo: Modulo }[] = [
  { href: '/admin', texto: 'Panel de Control', icono: '▦', modulo: 'panel' },
  { href: '/admin/ventas', texto: 'Ventas', icono: '🛒', modulo: 'ventas' },
  { href: '/admin/pedidos', texto: 'Pedidos', icono: '📋', modulo: 'pedidos' },
  { href: '/admin/inventario', texto: 'Inventario', icono: '📦', modulo: 'inventario' },
  { href: '/admin/compras', texto: 'Compras', icono: '🐂', modulo: 'compras' },
  { href: '/admin/reportes', texto: 'Reportes', icono: '📊', modulo: 'reportes' },
  { href: '/admin/usuarios', texto: 'Usuarios y Permisos', icono: '👥', modulo: 'usuarios' },
  { href: '/admin/configuracion', texto: 'Configuración', icono: '⚙', modulo: 'configuracion' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { sesion, listo, salir } = useAuth(); const router = useRouter(); const ruta = usePathname();
  const t = sesion?.tipo === 'trabajador' ? sesion.trabajador : null;
  const actual = ITEMS.find((i) => (i.href === '/admin' ? ruta === '/admin' : ruta.startsWith(i.href)));
  const permitido = !!t && (ruta.startsWith('/operario') || (actual ? puede(t.rol, actual.modulo) : false));

  useEffect(() => {
    if (!listo) return;
    if (!t) router.replace(`/login?next=${encodeURIComponent(ruta)}`);
    else if (!permitido) router.replace(RUTA_INICIO[t.rol]);
  }, [listo, t, permitido, router, ruta]);

  if (!listo || !t || !permitido) return <div className="grid min-h-screen place-items-center bg-ink text-neutral-300" role="status">Cargando…</div>;
  const menu = [
    ...(t.rol !== 'administrador' ? [{ href: '/operario', texto: 'Panel Operativo', icono: '▦', modulo: 'pedidos' as Modulo }] : []),
    ...ITEMS.filter((i) => puede(t.rol, i.modulo)),
  ];
  return (
    <div className="min-h-screen bg-ink text-neutral-100 md:flex">
      <aside className="border-b border-ink-line bg-ink-2 p-3 md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="mb-3 px-2"><Logo /></div>
        <nav aria-label="Menú del panel" className="flex gap-1 overflow-x-auto md:flex-col">
          {menu.map((i) => { const on = i.href === '/admin' ? ruta === '/admin' : ruta.startsWith(i.href); return (
            <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${on ? 'bg-brand text-white' : 'text-neutral-300 hover:bg-ink-3'}`}><span aria-hidden>{i.icono}</span>{i.texto}</Link>); })}
        </nav>
        <div className="mt-4 hidden space-y-2 border-t border-ink-line pt-3 md:block">
          <Link href="/" className="dk-btn-ghost w-full">← Ver tienda</Link>
          <button className="dk-btn-ghost w-full" onClick={() => { salir(); router.push('/login'); }}>Cerrar Sesión</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-end gap-3 text-sm text-neutral-400">
          <span className="rounded-full bg-ink-3 px-3 py-1">{t.nombres} · <span className="capitalize text-neutral-200">{t.rol}</span></span>
          <button className="dk-btn-ghost md:hidden" onClick={() => { salir(); router.push('/login'); }}>Salir</button>
        </div>
        {children}
      </main>
    </div>
  );
}

export const Titulo = ({ t, s }: { t: string; s?: string }) => (
  <header className="mb-5"><h1 className="text-2xl font-bold text-white">{t}</h1>{s && <p className="text-sm text-neutral-400">{s}</p>}</header>
);
export const Vacio = ({ children }: { children: React.ReactNode }) => <p className="p-6 text-center text-sm text-neutral-400">{children}</p>;
