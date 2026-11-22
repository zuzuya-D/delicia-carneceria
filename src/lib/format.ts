export const soles = (n: number) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const kg = (n: number) => `${n.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kg`;
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });
export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
export const diaCorto = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { weekday: 'short', timeZone: 'America/Lima' });
export const diaClave = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
