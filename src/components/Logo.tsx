export function Toro({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} fill="currentColor" aria-hidden>
      <path d="M2 4c2 14 9 20 17 21l2-7c-5-1-9-5-10-14zM62 4c-2 14-9 20-17 21l-2-7c5-1 9-5 10-14z" />
      <path d="M20 22h24l-2 20c-1 6-5 12-10 12s-9-6-10-12z" />
      <ellipse cx="25" cy="31" rx="2.6" ry="2" fill="#C0120C" /><ellipse cx="39" cy="31" rx="2.6" ry="2" fill="#C0120C" />
      <ellipse cx="32" cy="46" rx="6" ry="4" fill="#C0120C" opacity=".35" />
    </svg>
  );
}

export function Logo({ light = true, size = 'md' }: { light?: boolean; size?: 'md' | 'lg' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${light ? 'text-white' : 'text-brand'}`}>
      <Toro className={size === 'lg' ? 'h-14 w-14' : 'h-9 w-9'} />
      <span className={`font-extrabold italic leading-none ${size === 'lg' ? 'text-3xl' : 'text-lg'}`}>
        <span className="block text-[0.7em] font-bold">Carnicería</span>Delicias
      </span>
    </span>
  );
}
