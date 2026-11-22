// Hash de contraseñas SOLO para el modo demostración (localStorage).
// En el backend Express se reemplaza por bcrypt (bcrypt.hash / bcrypt.compare).
const SAL_DEMO = 'delicias:';

export async function hashClave(clave: string): Promise<string> {
  const datos = new TextEncoder().encode(SAL_DEMO + clave);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', datos);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Respaldo (contexto no seguro, p. ej. http por IP): FNV-1a, suficiente para una demo.
  let h = 0x811c9dc5;
  for (const b of datos) { h ^= b; h = Math.imul(h, 0x01000193); }
  return 'fnv:' + (h >>> 0).toString(16);
}
