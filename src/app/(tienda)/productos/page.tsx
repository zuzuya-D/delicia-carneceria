import { Suspense } from 'react';
import { Catalogo } from './Catalogo';

export const metadata = { title: 'Productos · Carnicería Delicias' };
export default function Productos() {
  return <Suspense fallback={<p className="p-8">Cargando…</p>}><Catalogo /></Suspense>;
}
