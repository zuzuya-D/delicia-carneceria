'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Estado persistido en localStorage (solo mientras no exista el backend).
// Todas las instancias que usan la misma clave se mantienen sincronizadas
// (en la misma pestaña con un evento propio y entre pestañas con "storage").
const EVENTO = 'delicias:storage';

function leer<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined; // datos corruptos o almacenamiento bloqueado
  }
}

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [listo, setListo] = useState(false);
  const actual = useRef(value);
  actual.current = value;

  useEffect(() => {
    const cargar = () => { const v = leer<T>(key); if (v !== undefined) setValue(v); };
    cargar();
    setListo(true);
    const onPropio = (e: Event) => { if ((e as CustomEvent<string>).detail === key) cargar(); };
    const onOtraPestana = (e: StorageEvent) => { if (e.key === key) cargar(); };
    window.addEventListener(EVENTO, onPropio);
    window.addEventListener('storage', onOtraPestana);
    return () => { window.removeEventListener(EVENTO, onPropio); window.removeEventListener('storage', onOtraPestana); };
  }, [key]);

  const set = useCallback((v: T | ((p: T) => T)) => {
    // Se parte del valor guardado para no pisar cambios hechos por otra instancia.
    const prev = leer<T>(key) ?? actual.current;
    const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* sin espacio o bloqueado */ }
    setValue(next);
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: key }));
  }, [key]);

  return [value, set, listo] as const;
}
