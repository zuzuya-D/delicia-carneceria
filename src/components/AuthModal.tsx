'use client';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PanelAuth, type VistaAuth } from './AuthForms';

interface Ctx { abrir: (vista?: VistaAuth) => void }
const ModalCtx = createContext<Ctx | null>(null);
export const useAuthModal = () => { const c = useContext(ModalCtx); if (!c) throw new Error('Falta <AuthModalProvider>'); return c; };

/** Ventana de inicio de sesión / registro que se abre encima de la tienda. */
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [vista, setVista] = useState<VistaAuth | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const previo = useRef<HTMLElement | null>(null);

  const abrir = useCallback((v: VistaAuth = 'login') => {
    previo.current = document.activeElement as HTMLElement | null;
    setVista(v);
  }, []);
  const cerrar = useCallback(() => { setVista(null); previo.current?.focus?.(); }, []);

  useEffect(() => {
    if (!vista) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // evita que la página de fondo se desplace
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
      if (e.key !== 'Tab' || !caja.current) return;
      // Mantiene el foco dentro de la ventana
      const f = caja.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, a[href], [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener('keydown', tecla);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', tecla); };
  }, [vista, cerrar]);

  const onExito = (ruta: string, esCliente: boolean) => {
    setVista(null);
    if (!esCliente) router.push(ruta); // el personal va a su panel; el cliente sigue donde estaba
  };

  return (
    <ModalCtx.Provider value={{ abrir }}>
      {children}
      {vista && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
          onMouseDown={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
          <div ref={caja} role="dialog" aria-modal="true" aria-labelledby="titulo-auth"
            className="relative my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={cerrar} aria-label="Cerrar ventana"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-xl text-neutral-600 hover:bg-neutral-100"><span aria-hidden>×</span></button>
            <PanelAuth key={vista} vista={vista} setVista={setVista} onExito={onExito} tituloId="titulo-auth" />
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
