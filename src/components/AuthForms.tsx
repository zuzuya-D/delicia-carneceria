'use client';
import { useId, useState } from 'react';
import { CLAVE_DEMO } from '@/lib/data';
import { type DatosRegistro, useAuth } from '@/lib/providers';
import type { Cliente } from '@/lib/types';
import { validarClave, validarCorreo, validarDni, validarRuc, validarTelefono } from '@/lib/validacion';
import { Logo } from './Logo';

export type VistaAuth = 'login' | 'registro';
type CampoR = 'nombre' | 'documento' | 'correo' | 'telefono' | 'direccion' | 'clave' | 'clave2';

function Campo({ etiqueta, valor, onChange, error, type = 'text', autoComplete, inputMode, opcional, maxLength, autoFocus }: {
  etiqueta: string; valor: string; onChange: (v: string) => void; error?: string | null; type?: string; autoFocus?: boolean;
  autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; opcional?: boolean; maxLength?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-800">
        {etiqueta} {opcional && <span className="font-normal text-neutral-600">(opcional)</span>}
      </label>
      <input id={id} className={`input ${error ? '!border-red-600' : ''}`} type={type} value={valor} autoComplete={autoComplete} autoFocus={autoFocus}
        inputMode={inputMode} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => onChange(e.target.value)} />
      {error && <p id={`${id}-e`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function IconoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Botón "Continuar con Google": requiere OAuth en el backend; por ahora solo informa. */
function BotonGoogle({ onAviso }: { onAviso: (m: string) => void }) {
  return (
    <button type="button" className="btn w-full border border-neutral-300 bg-white !py-3 text-neutral-800 hover:bg-neutral-50"
      onClick={() => onAviso('El acceso con Google estará disponible cuando se conecte el servidor. Por ahora usa tu correo o DNI/RUC.')}>
      <IconoGoogle /> Continuar con Google
    </button>
  );
}

const Separador = () => (
  <div className="flex items-center gap-3 text-xs text-neutral-600" aria-hidden><span className="h-px flex-1 bg-neutral-300" />o<span className="h-px flex-1 bg-neutral-300" /></div>
);

/**
 * Panel de autenticación con dos vistas en el mismo lugar:
 * "login" (con Continuar con Google y Crear cuenta debajo) y "registro".
 * onExito recibe la ruta sugerida ('/' para clientes, el panel para trabajadores).
 */
export function PanelAuth({ vista, setVista, onExito, tituloId }: {
  vista: VistaAuth; setVista: (v: VistaAuth) => void; onExito: (ruta: string, esCliente: boolean) => void; tituloId: string;
}) {
  const { entrar, registrar } = useAuth();
  const [aviso, setAviso] = useState('');
  // --- login
  const [id, setId] = useState(''); const [clave, setClave] = useState(''); const [ver, setVer] = useState(false);
  const [err, setErr] = useState(''); const [enviando, setEnviando] = useState(false);
  // --- registro
  const [tipo, setTipo] = useState<Cliente['tipo']>('Minorista');
  const [r, setR] = useState<Record<CampoR, string>>({ nombre: '', documento: '', correo: '', telefono: '', direccion: '', clave: '', clave2: '' });
  const [errs, setErrs] = useState<Partial<Record<CampoR, string>>>({});
  const [errR, setErrR] = useState('');

  const cambiar = (v: VistaAuth) => { setAviso(''); setErr(''); setErrR(''); setVista(v); };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setEnviando(true);
    const res = await entrar(id, clave); setEnviando(false);
    if ('error' in res) setErr(res.error); else { setErr(''); onExito(res.ruta, res.ruta === '/'); }
  };

  const onRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Partial<Record<CampoR, string>> = {};
    if (!r.nombre.trim()) v.nombre = tipo === 'Minorista' ? 'Ingresa tu nombre completo.' : 'Ingresa la razón social.';
    const d = tipo === 'Minorista' ? validarDni(r.documento) : validarRuc(r.documento); if (d) v.documento = d;
    const c = validarCorreo(r.correo); if (c) v.correo = c;
    const t = validarTelefono(r.telefono); if (t) v.telefono = t;
    const k = validarClave(r.clave); if (k) v.clave = k;
    if (!v.clave && r.clave !== r.clave2) v.clave2 = 'Las contraseñas no coinciden.';
    setErrs(v);
    if (Object.keys(v).length) { setErrR('Revisa los campos marcados en rojo.'); return; }
    const datos: DatosRegistro = { tipo, ...r, direccion: r.direccion || undefined };
    const res = await registrar(datos);
    if ('error' in res) setErrR(res.error); else { setErrR(''); onExito(res.ruta, true); }
  };
  const set = (k: CampoR) => (val: string) => { setR((p) => ({ ...p, [k]: val })); setErrs((p) => ({ ...p, [k]: undefined })); };

  const avisoGoogle = aviso && <p role="status" className="rounded bg-sky-50 p-2 text-sm text-sky-900">{aviso}</p>;

  if (vista === 'login') return (
    <form onSubmit={onLogin} className="space-y-4" noValidate>
      <div className="flex justify-center"><Logo light={false} size="lg" /></div>
      <h2 id={tituloId} className="text-center text-2xl font-bold">Iniciar Sesión</h2>
      <p className="text-center text-sm text-neutral-600">Accede a tu cuenta para hacer pedidos</p>
      <Campo etiqueta="Correo, DNI/RUC o usuario" valor={id} onChange={setId} autoComplete="username" autoFocus />
      <div>
        <label htmlFor="clave-login" className="mb-1 block text-sm font-medium text-neutral-800">Contraseña</label>
        <div className="relative">
          <input id="clave-login" className="input pr-11" type={ver ? 'text' : 'password'} value={clave}
            onChange={(e) => setClave(e.target.value)} autoComplete="current-password" />
          <button type="button" className="absolute right-2 top-1.5 rounded px-1.5 py-0.5 text-neutral-600" onClick={() => setVer((x) => !x)}
            aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={ver}><span aria-hidden>{ver ? '🙈' : '👁'}</span></button>
        </div>
      </div>
      {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      <button className="btn-brand w-full !py-3" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
      <Separador />
      <BotonGoogle onAviso={setAviso} />
      {avisoGoogle}
      <button type="button" className="btn w-full border-2 border-brand bg-white !py-3 text-brand hover:bg-brand-light" onClick={() => cambiar('registro')}>
        Crear cuenta
      </button>
      <p className="rounded bg-amber-50 p-3 text-xs text-amber-900">
        <b>Modo demostración</b>. Personal: <b>admin</b>, <b>jperez</b>, <b>lgarcia</b> o <b>cruiz</b> con clave <b>{CLAVE_DEMO}</b>.
      </p>
    </form>
  );

  return (
    <form onSubmit={onRegistro} className="space-y-3" noValidate>
      <div className="flex justify-center"><Logo light={false} size="lg" /></div>
      <h2 id={tituloId} className="text-center text-2xl font-bold">Crear cuenta</h2>
      <p className="text-center text-sm text-neutral-600">Regístrate y empieza a realizar tus pedidos</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de cliente">
        {(['Minorista', 'Mayorista'] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tipo === t} onClick={() => { setTipo(t); setErrs({}); setErrR(''); }}
            className={`rounded-lg p-3 text-sm font-semibold ${tipo === t ? 'bg-brand text-white' : 'bg-white text-neutral-800 ring-1 ring-neutral-300'}`}>
            {t === 'Minorista' ? 'Persona Natural' : 'Negocio / Empresa'}
            <span className="block text-xs font-normal">{t === 'Minorista' ? 'Minorista · DNI' : 'Mayorista · RUC'}</span>
          </button>))}
      </div>
      <Campo etiqueta={tipo === 'Minorista' ? 'Nombre completo' : 'Razón social'} valor={r.nombre} onChange={set('nombre')} error={errs.nombre} autoComplete={tipo === 'Minorista' ? 'name' : 'organization'} autoFocus />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta={tipo === 'Minorista' ? 'DNI (8 dígitos)' : 'RUC (11 dígitos)'} valor={r.documento} onChange={set('documento')} error={errs.documento} inputMode="numeric" maxLength={tipo === 'Minorista' ? 8 : 11} />
        <Campo etiqueta="Teléfono (9 dígitos)" valor={r.telefono} onChange={set('telefono')} error={errs.telefono} type="tel" autoComplete="tel-national" inputMode="numeric" maxLength={11} />
      </div>
      <Campo etiqueta="Correo electrónico" valor={r.correo} onChange={set('correo')} error={errs.correo} type="email" autoComplete="email" />
      <Campo etiqueta="Dirección" opcional valor={r.direccion} onChange={set('direccion')} autoComplete="street-address" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Contraseña" valor={r.clave} onChange={set('clave')} error={errs.clave} type="password" autoComplete="new-password" />
        <Campo etiqueta="Repite la contraseña" valor={r.clave2} onChange={set('clave2')} error={errs.clave2} type="password" autoComplete="new-password" />
      </div>
      {errR && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{errR}</p>}
      <button className="btn-brand w-full !py-3">Registrarse</button>
      {tipo === 'Mayorista' && <p className="text-center text-xs text-neutral-600">Las cuentas de negocio ven el precio por mayor.</p>}
      <Separador />
      <BotonGoogle onAviso={setAviso} />
      {avisoGoogle}
      <p className="text-center text-sm text-neutral-700">¿Ya tienes cuenta?{' '}
        <button type="button" className="font-semibold text-brand underline" onClick={() => cambiar('login')}>Inicia sesión</button></p>
    </form>
  );
}
