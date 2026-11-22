# Carnicería Delicias · Frontend (Next.js + Tailwind)

Tienda en línea y panel de administración de la Carnicería "Delicias" (Andahuaylas).
Etapa actual: **frontend** con datos de demostración que tienen la misma forma que las 8 tablas de `database/schema.sql`.

## Stack
Next.js 15 (React 19) · Tailwind CSS · Docker · (después) Node.js + Express, PostgreSQL, JWT + bcrypt · Render o Railway.

## Cómo ejecutarlo
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
docker build -t delicias-web . && docker run -p 3000:3000 delicias-web
```

## Pantallas
- Tienda: inicio, productos (filtro por categoría y búsqueda), carrito y pedido, contacto, inicio de sesión / registro (minorista con DNI, mayorista con RUC; el mayorista ve `precio_mayor_kg`).
- Panel (`/admin`, rol administrador): panel de control, ventas, pedidos, inventario, compras de ganado y camal, reportes (con exportación CSV), usuarios y permisos, configuración.
- Panel operativo (`/operario`, vendedor y operario): cola de pedidos del local, venta rápida con descuento de stock, alertas de stock.

## Modo demostración (sin backend)
- Personal: usuario `admin`, `jperez`, `lgarcia` o `cruiz`, clave `delicias123`.
- Clientes: se registran en la pantalla de login; la sesión y los datos se guardan en `localStorage`.
- Los precios, el stock y las ventas son datos de ejemplo (`src/lib/data.ts`), no los reales del negocio.
- Fotos de productos: copia `public/productos/<id_producto>.jpg`; si no existe se muestra un bloque de color.

## Pendiente para el backend
- Reemplazar `src/lib/data.ts`, `hooks.tsx` y `providers.tsx` por llamadas a la API Express; autenticación con JWT + bcrypt.
- Los pedidos web no tienen tabla: `venta.id_trabajador` es obligatorio, así que hay que decidir si se agrega una tabla `cliente`/`pedido` o se registra un trabajador "web".
- La tabla `proceso_camal` guarda los kilos obtenidos pero no los reparte por corte; hoy el stock se ajusta a mano.
