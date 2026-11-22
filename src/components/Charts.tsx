'use client';
import { soles } from '@/lib/format';

export const COLORES = ['#E5484D', '#F5A524', '#9CA3AF', '#B45309', '#7C3AED', '#10B981'];

export function AreaChart({ puntos, height = 200, etiquetaX }: { puntos: { x: string; y: number }[]; height?: number; etiquetaX?: (x: string, i: number) => string }) {
  const W = 640, H = height, pad = { l: 44, r: 12, t: 14, b: 26 };
  const max = Math.max(1, ...puntos.map((p) => p.y)) * 1.1;
  const sx = (i: number) => pad.l + (puntos.length < 2 ? 0 : (i / (puntos.length - 1)) * (W - pad.l - pad.r));
  const sy = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const area = `${linea} L${sx(puntos.length - 1)},${H - pad.b} L${sx(0)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const paso = Math.ceil(puntos.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de líneas">
      {ticks.map((t) => (<g key={t}><line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} stroke="#323744" strokeDasharray="3 4" />
        <text x={pad.l - 6} y={sy(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : Math.round(t)}</text></g>))}
      <path d={area} fill="#C0120C" opacity=".22" /><path d={linea} fill="none" stroke="#F87171" strokeWidth="2.2" />
      {puntos.map((p, i) => (<g key={p.x}>
        <circle cx={sx(i)} cy={sy(p.y)} r="2.6" fill="#FCA5A5"><title>{`${p.x}: ${soles(p.y)}`}</title></circle>
        {i % paso === 0 && <text x={sx(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">{etiquetaX ? etiquetaX(p.x, i) : p.x}</text>}
      </g>))}
    </svg>
  );
}

export function BarrasAgrupadas({ grupos, height = 220 }: { grupos: { etiqueta: string; a: number; b: number }[]; height?: number }) {
  const W = 640, H = height, pad = { l: 48, r: 10, t: 14, b: 26 };
  const max = Math.max(1, ...grupos.flatMap((g) => [g.a, g.b])) * 1.1;
  const bw = (W - pad.l - pad.r) / grupos.length;
  const sy = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ingresos frente a egresos">
      {[0, 0.5, 1].map((f) => (<g key={f}><line x1={pad.l} x2={W - pad.r} y1={sy(f * max)} y2={sy(f * max)} stroke="#323744" strokeDasharray="3 4" />
        <text x={pad.l - 6} y={sy(f * max) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{Math.round((f * max) / 1000)}k</text></g>))}
      {grupos.map((g, i) => { const x = pad.l + i * bw; const w = bw * 0.32; return (<g key={g.etiqueta}>
        <rect x={x + bw * 0.14} y={sy(g.a)} width={w} height={H - pad.b - sy(g.a)} fill="#DC2626" rx="2"><title>{`Ingresos ${soles(g.a)}`}</title></rect>
        <rect x={x + bw * 0.14 + w + 3} y={sy(g.b)} width={w} height={H - pad.b - sy(g.b)} fill="#9CA3AF" rx="2"><title>{`Egresos ${soles(g.b)}`}</title></rect>
        <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">{g.etiqueta}</text></g>); })}
    </svg>
  );
}

export function Dona({ partes }: { partes: { nombre: string; valor: number }[] }) {
  const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
  const R = 52, C = 2 * Math.PI * R; let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label="Distribución">
        {partes.map((p, i) => { const len = (p.valor / total) * C; const el = (
          <circle key={p.nombre} cx="70" cy="70" r={R} fill="none" stroke={COLORES[i % COLORES.length]} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}><title>{`${p.nombre}: ${Math.round((p.valor / total) * 100)} %`}</title></circle>); acc += len; return el; })}
      </svg>
      <ul className="space-y-1 text-xs text-neutral-300">
        {partes.map((p, i) => (<li key={p.nombre} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORES[i % COLORES.length] }} />{p.nombre} <b className="text-neutral-100">{Math.round((p.valor / total) * 100)} %</b></li>))}
      </ul>
    </div>
  );
}

export function BarraH({ etiqueta, valor, max, texto, alerta }: { etiqueta: string; valor: number; max: number; texto: string; alerta?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-300"><span>{etiqueta}</span><span className="text-neutral-400">{texto}</span></div>
      <div className="h-2 rounded bg-ink-3"><div className={`h-2 rounded ${alerta ? 'bg-red-500' : 'bg-neutral-300'}`} style={{ width: `${Math.min(100, (valor / (max || 1)) * 100)}%` }} /></div>
    </div>
  );
}
