# Carnicería Delicias · Frontend (Next.js + Tailwind)

Tienda en línea y paneles internos de la Carnicería "Delicias" (Andahuaylas, Apurímac), con dos locales:

| id_local | nombre_local | direccion |
|---|---|---|
| 1 | Local 1 - Sede Central | Av. Pedro Reyes 450 |
| 2 | Local 2 - Mercado Modelo | Jr. Ayacucho 215 |

**Etapa actual: solo frontend.** Los datos de demostración tienen exactamente la forma de las 8 tablas de
[`database/schema.sql`](database/schema.sql) y, junto con la sesión, se guardan en `localStorage`.

## Stack
- Ahora: Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS · Docker.
- Después: Node.js + Express · PostgreSQL · JWT + bcrypt · despliegue en Render o Railway.

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior (la imagen Docker usa Node 22).

```bash
npm install
npm run dev            # desarrollo en http://localhost:3000
npm run build          # compilación de producción (verifica tipos de TypeScript)
npm start              # sirve la compilación en http://localhost:3000
npm run lint           # solo verificación de tipos (tsc --noEmit)
```

Con Docker (imagen de producción, salida `standalone` de Next.js):

```bash
docker build -t delicias-web .
docker run -p 3000:3000 delicias-web
```

En Render o Railway basta con apuntar al `Dockerfile`; la app escucha en el puerto de la variable `PORT` (3000 por defecto).

## Cuentas de demostración

| Usuario | Rol | Local | Entra a |
|---|---|---|---|
| `admin` | administrador | Local 1 | `/admin` (todo) |
| `jperez` | vendedor | Local 1 | `/operario` + Ventas, Pedidos, Inventario |
| `lgarcia` | vendedor | Local 2 | `/operario` + Ventas, Pedidos, Inventario |
| `cruiz` | operario | Local 2 | `/operario` + Pedidos, Inventario |

Clave de todo el personal: **`delicias123`**. Los clientes se registran desde la tienda (Persona Natural con
DNI o Negocio con RUC) y luego entran con su correo o su DNI/RUC. El administrador puede crear más
trabajadores en *Usuarios y Permisos*.

Para volver a los datos iniciales, borra el almacenamiento del sitio en el navegador (claves `delicias.*`).

## Pantallas

**Tienda (tema claro)**
- `/` Inicio: encabezado rojo con logo, menú Categoría / Productos / Contacto, buscador, carrito con contador y
  cuenta; banner "Carnes de calidad, sabor que te encanta"; 4 productos destacados; franja de servicios.
- `/productos`: grilla con filtro por categoría y búsqueda (sin tildes ni mayúsculas); el filtro queda en la URL.
- **Iniciar sesión / Registrarme**: se abre como ventana encima de la tienda (desde el menú de cuenta o al
  confirmar el carrito sin sesión). Debajo del formulario están *Continuar con Google* y *Crear cuenta*; el
  registro aparece en la misma ventana. Registro: DNI de 8 dígitos o RUC de 11, teléfono de 9 dígitos que
  empieza con 9, correo, contraseña de mínimo 6 caracteres y dirección opcional. `/login` muestra la misma
  tarjeta cuando los paneles piden iniciar sesión.
- `/carrito`: cantidades en pasos de 0.5 kg, precio, subtotal, eliminar; local de atención, recojo o delivery
  con dirección, Efectivo o Yape; valida stock del local elegido. El mayorista ve `precio_mayor_kg`.
- `/contacto`: locales y medios de pago.

**Panel administrador (`/admin`, tema oscuro)**: Panel de Control, Ventas, Pedidos, Inventario, Compras
(compra de ganado + proceso de camal y costo por kilo), Reportes (ingresos vs. egresos por semana, margen
bruto, exportar CSV), Usuarios y Permisos, Configuración (venta online, delivery, Yape, efectivo, tiempo
máximo de preparación; se aplican al carrito de inmediato).

**Panel operativo (`/operario`, vendedor y operario)**: cola de pedidos del propio local (marca los que
superan el tiempo máximo), venta rápida que descuenta stock (solo roles con permiso de Ventas) y alertas
de stock crítico (< 15 kg).

### Flujo de un pedido web
1. El cliente confirma el carrito → pedido **Pendiente** (se valida stock, pero aún no se descuenta).
2. **Iniciar preparación** → se vuelve a validar y se descuenta `stock_inventario` del local.
3. Delivery: **Enviado** → **Entregado**. Recojo: directamente **Entregado**.
4. Al entregar se crea `venta` + `detalle_venta` con el `id_trabajador` de quien cerró el pedido.

## Estructura

```
src/
  app/(tienda)/      inicio, productos, carrito, contacto (layout con encabezado y ventana de acceso)
  app/login/         página de acceso para los paneles
  app/admin/         panel administrador (Shell valida sesión y permisos)
  app/operario/      panel operativo
  components/        Header, AuthModal/AuthForms, Shell, TablaPedidos, gráficos SVG, tarjetas
  lib/types.ts       tipos 1:1 con las tablas (+ tipos solo de interfaz, marcados)
  lib/data.ts        datos de demostración (locales, trabajadores, productos, stock, compras, ventas)
  lib/hooks.tsx      acceso a datos (localStorage) — cada hook indica su endpoint futuro
  lib/providers.tsx  sesión y carrito
  lib/api.ts         cliente fetch de la API Express (listo, aún sin uso)
  lib/permissions.ts permisos por rol
  lib/validacion.ts  reglas de DNI, RUC, teléfono, correo, kg
```

## Cómo conectar el backend
1. Define `NEXT_PUBLIC_API_URL` (por ejemplo `https://delicias-api.onrender.com`).
2. Sustituye el cuerpo de cada hook de `src/lib/hooks.tsx` por la llamada equivalente de `src/lib/api.ts`
   (los comentarios de cada hook indican el endpoint) y `entrar`/`registrar` de `providers.tsx` por
   `POST /api/auth/login` guardando solo el JWT.
3. Borra `src/lib/crypto.ts` y los `password_hash` de `data.ts`: en el servidor se usa bcrypt.
4. Repite en Express las validaciones de `validacion.ts` y la de stock suficiente (dentro de una transacción
   que inserte `venta` + `detalle_venta` y descuente `stock_inventario`).

## Pendiente para el backend (no se agregó al esquema)
El esquema de 8 tablas **no se modificó**. Para que el sistema funcione completo hacen falta decisiones que
hoy el frontend resuelve con datos que solo viven en `localStorage`:

- **Clientes**: no hay tabla `cliente` (tipo minorista/mayorista, DNI/RUC, nombre, correo, teléfono,
  dirección, contraseña). Hoy se guardan en `delicias.clientes`.
- **Pedidos web**: no hay tabla `pedido` ni `detalle_pedido` (estado, dirección de entrega, cliente, fecha).
  Hoy viven en `delicias.pedidos`; solo al entregarse se convierten en `venta` + `detalle_venta`.
  `venta` no tiene referencia al cliente ni al pedido de origen.
- **Venta en línea sin trabajador**: `venta.id_trabajador` es obligatorio; por eso la venta se registra a
  nombre de quien entrega el pedido. Hay que confirmar si esa es la regla del negocio.
- **Configuración**: interruptores (venta online, delivery, Yape, efectivo) y tiempo máximo de preparación
  no tienen tabla.
- **Costo de envío**: no existe campo; hoy el envío local es S/ 0.00.
- **Stock mínimo**: el umbral de stock bajo (15 kg) es una constante, no un campo de `stock_inventario`.
- **Camal → stock**: `proceso_camal` guarda los kilos totales pero no su reparto por corte ni por local; el
  stock se añade a mano en Inventario.
- **Continuar con Google**: el botón existe en la ventana de inicio de sesión/registro, pero solo muestra un
  aviso. Requiere OAuth de Google en Express (Client ID, ruta de retorno) y la tabla de clientes.
- **Usuarios**: no se pueden editar ni desactivar trabajadores (no hay campo `activo`); solo crear.
- **Permisos**: la matriz de permisos por rol está fija en `src/lib/permissions.ts`; el backend debe
  validarla también en cada endpoint (middleware JWT + rol).
- **Fotos de productos**: no hay campo de imagen. Para mostrar una foto copia
  `public/productos/<id_producto>.jpg` y agrega el id a `FOTOS_PRODUCTO` en `src/lib/data.ts`.
- Los precios, el stock y las ventas son **datos de ejemplo**, no los reales del negocio.
