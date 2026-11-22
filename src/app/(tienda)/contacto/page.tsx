import { locales } from '@/lib/data';

export const metadata = { title: 'Contacto · Carnicería Delicias' };
export default function Contacto() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="border-l-4 border-brand pl-3 text-2xl font-bold">Contacto</h1>
      <p className="mt-3 text-neutral-600">Atendemos en dos locales de Andahuaylas. Puedes recoger tu pedido o pedir envío local.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {locales.map((l) => (<div key={l.id_local} className="rounded-xl bg-white p-5 shadow-card"><h2 className="font-semibold text-brand">{l.nombre_local}</h2><p className="mt-1 text-sm text-neutral-700">{l.direccion}</p></div>))}
      </div>
      <p className="mt-6 text-sm text-neutral-500">Medios de pago: efectivo o Yape.</p>
    </div>
  );
}
