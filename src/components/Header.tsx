'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS } from '@/lib/data';
import { RUTA_INICIO } from '@/lib/permissions';
import { useAuth, useCart } from '@/lib/providers';
import { useAuthModal } from './AuthModal';
import { Logo } from './Logo';

/** Cierra un menú desplegable al hacer clic fuera o con Escape (devolviendo el foco al botón). */
function useDesplegable() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null); const boton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAbierto(false); boton.current?.focus(); } };
    document.addEventListener('mousedown', fuera); document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla); };
  }, [abierto]);
  const alSalirFoco = (e: React.FocusEvent) => { if (!caja.current?.contains(e.relatedTarget as Node)) setAbierto(false); };
  return { abierto, setAbierto, caja, boton, alSalirFoco };
}

export function Header() {
  const router = useRouter();
  const { sesion, salir } = useAuth();
  const { lineas } = useCart(); const { abrir } = useAuthModal();
  const [q, setQ] = useState('');
  const cat = useDesplegable(); const cuenta = useDesplegable();
  const buscar = (e: React.FormEvent) => { e.preventDefault(); router.push(`/productos${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); };
  const nombre = sesion?.tipo === 'trabajador' ? sesion.trabajador.nombres : sesion?.cliente.nombre;
  const n = lineas.length;

  return (
    <header className="sticky top-0 z-30 bg-brand text-white shadow">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-brand">Saltar al contenido</a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
        <Link href="/" aria-label="Carnicería Delicias, ir al inicio"><Logo /></Link>
        <nav aria-label="Principal" className="flex items-center gap-5 text-sm font-semibold">
          <div className="relative" ref={cat.caja} onBlur={cat.alSalirFoco}>
            <button ref={cat.boton} type="button" onClick={() => cat.setAbierto((v) => !v)} aria-expanded={cat.abierto} aria-controls="menu-categorias" className="rounded px-1 hover:underline">
              Categoría <span aria-hidden>▾</span></button>
            {cat.abierto && (
              <ul id="menu-categorias" className="absolute left-0 top-full z-40 mt-2 min-w-44 rounded-lg bg-white py-1 text-neutral-800 shadow-lg">
                {CATEGORIAS.map((c) => (<li key={c}><Link href={`/productos?cat=${encodeURIComponent(c)}`} onClick={() => cat.setAbierto(false)} className="block px-4 py-2 text-sm hover:bg-brand-light focus:bg-brand-light">{c}</Link></li>))}
              </ul>
            )}
          </div>
          <Link href="/productos" className="rounded px-1 hover:underline">Productos</Link>
          <Link href="/contacto" className="rounded px-1 hover:underline">Contacto</Link>
        </nav>
        <form onSubmit={buscar} role="search" className="ml-auto flex w-full max-w-sm flex-1 items-center rounded-lg bg-white px-3 text-neutral-800 sm:w-auto">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos…" aria-label="Buscar productos" className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-neutral-500" />
          <button type="submit" aria-label="Buscar" className="text-neutral-600"><span aria-hidden>🔍</span></button>
        </form>
        <Link href="/carrito" className="relative rounded text-xl" aria-label={`Carrito de compras, ${n} ${n === 1 ? 'producto' : 'productos'}`}>
          <span aria-hidden>🛒</span>
          {n > 0 && <span aria-hidden className="absolute -right-2 -top-2 rounded-full bg-white px-1.5 text-[10px] font-bold text-brand">{n}</span>}
        </Link>
        <div className="relative" ref={cuenta.caja} onBlur={cuenta.alSalirFoco}>
          <button ref={cuenta.boton} type="button" onClick={() => cuenta.setAbierto((v) => !v)} aria-expanded={cuenta.abierto} aria-controls="menu-cuenta"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg" aria-label={sesion ? `Mi cuenta: ${nombre}` : 'Mi cuenta'}><span aria-hidden>👤</span></button>
          {cuenta.abierto && (
            <div id="menu-cuenta" className="absolute right-0 top-full z-40 mt-2 w-60 rounded-lg bg-white p-2 text-sm text-neutral-800 shadow-lg">
              {sesion ? (<>
                <p className="px-2 py-1 font-semibold">{nombre}</p>
                {sesion.tipo === 'cliente' && <p className="px-2 pb-1 text-xs text-neutral-600">Cuenta {sesion.cliente.tipo === 'Mayorista' ? 'de negocio (precio por mayor)' : 'personal (precio por menor)'}</p>}
                {sesion.tipo === 'trabajador' && <Link href={RUTA_INICIO[sesion.trabajador.rol]} className="block rounded px-2 py-1.5 hover:bg-brand-light" onClick={() => cuenta.setAbierto(false)}>Ir al panel</Link>}
                <button type="button" className="block w-full rounded px-2 py-1.5 text-left hover:bg-brand-light" onClick={() => { salir(); cuenta.setAbierto(false); router.push('/'); }}>Cerrar sesión</button>
              </>) : (<>
                <button type="button" className="block w-full rounded px-2 py-1.5 text-left hover:bg-brand-light" onClick={() => { cuenta.setAbierto(false); abrir('login'); }}>Iniciar sesión</button>
                <button type="button" className="block w-full rounded px-2 py-1.5 text-left hover:bg-brand-light" onClick={() => { cuenta.setAbierto(false); abrir('registro'); }}>Registrarme</button>
              </>)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
