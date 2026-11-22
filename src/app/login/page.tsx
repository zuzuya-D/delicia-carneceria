'use client';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PanelAuth, type VistaAuth } from '@/components/AuthForms';
import { useAuth } from '@/lib/providers';

// Página de respaldo: se usa cuando se entra directo a /login o cuando los paneles
// redirigen sin sesión. En la tienda, el mismo formulario se abre como ventana emergente.
function Contenido() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next');
  const { sesion } = useAuth();
  const [vista, setVista] = useState<VistaAuth>(sp.get('vista') === 'registro' ? 'registro' : 'login');

  const onExito = (ruta: string, esCliente: boolean) => {
    // Solo rutas internas; un cliente nunca vuelve a rutas del panel
    const interna = !!next && next.startsWith('/') && !next.startsWith('//');
    const esPanel = !!next && /^\/(admin|operario)(\/|$)/.test(next);
    router.push(interna && !(esCliente && esPanel) ? next! : ruta);
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
      <PanelAuth key={vista} vista={vista} setVista={setVista} onExito={onExito} tituloId="titulo-auth" />
      <p className="mt-4 text-center text-sm">
        {sesion && <span className="block text-xs text-neutral-600">Ya tienes una sesión abierta.</span>}
        <Link className="font-semibold text-brand underline" href="/">← Volver a la tienda</Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-red-950 via-neutral-900 to-red-900 p-4">
      <Suspense fallback={null}><Contenido /></Suspense>
    </main>
  );
}
