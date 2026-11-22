// Reglas de validación compartidas (se repetirán en el backend Express).
// Cada función devuelve un mensaje de error en español o null si el valor es válido.

export const soloDigitos = (s: string) => s.replace(/[\s-]/g, '');

export function validarDni(s: string) {
  return /^\d{8}$/.test(soloDigitos(s)) ? null : 'El DNI debe tener exactamente 8 dígitos.';
}
export function validarRuc(s: string) {
  const r = soloDigitos(s);
  if (!/^\d{11}$/.test(r)) return 'El RUC debe tener exactamente 11 dígitos.';
  if (!/^(10|15|17|20)/.test(r)) return 'El RUC debe empezar con 10, 15, 17 o 20.';
  return null;
}
export function validarTelefono(s: string) {
  return /^9\d{8}$/.test(soloDigitos(s)) ? null : 'El teléfono debe tener 9 dígitos y empezar con 9.';
}
export function validarCorreo(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()) ? null : 'Ingresa un correo electrónico válido (ej. nombre@correo.com).';
}
export function validarClave(s: string) {
  return s.length >= 6 ? null : 'La contraseña debe tener al menos 6 caracteres.';
}

/** Convierte "1,5" o "1.5" a número; NaN si no es un número. */
export const aNumero = (s: string) => (s.trim() === '' ? NaN : Number(s.trim().replace(',', '.')));

/** Valida una cantidad en kg (> 0, máximo 2 decimales). */
export function validarKg(s: string, etiqueta = 'La cantidad') {
  const n = aNumero(s);
  if (!Number.isFinite(n) || n <= 0) return `${etiqueta} debe ser un número mayor a 0.`;
  if (Math.abs(Math.round(n * 100) - n * 100) > 1e-6) return `${etiqueta} admite como máximo 2 decimales.`;
  return null;
}

export const redondear2 = (n: number) => Math.round(n * 100) / 100;
