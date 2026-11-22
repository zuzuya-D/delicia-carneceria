export function StatCard({ titulo, valor, nota, tono = 'neutral' }: { titulo: string; valor: string; nota?: string; tono?: 'neutral' | 'ok' | 'alerta' }) {
  const c = tono === 'ok' ? 'text-emerald-400' : tono === 'alerta' ? 'text-red-400' : 'text-neutral-400';
  return (
    <div className="dk-card">
      <p className="text-xs font-medium text-neutral-400">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-white">{valor}</p>
      {nota && <p className={`mt-1 text-xs ${c}`}>{nota}</p>}
    </div>
  );
}
