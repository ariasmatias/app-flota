# Frontend

Interfaz React en JavaScript, construida con Vite.

## Cómo levantarlo

Requiere Node.js 22 LTS (22.12 o superior).

```
cd frontend
npm install
npm run dev
```

Abre en http://localhost:5173. Las llamadas a `/api` se reenvían al backend local en el puerto 3001.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera `dist/` para servir con Nginx |
| `npm run preview` | Sirve el build localmente para probarlo |

## Sesión en desarrollo

Mientras no esté el login con Active Directory (I-01), `npm run dev` usa un **usuario simulado**. La barra amarilla de arriba tiene un selector **Ver como** para probar la pantalla con el usuario de cada área. Los usuarios son ficticios y están en `src/core/sesion/usuariosDePrueba.js`.

Con `VITE_AUTH_MODE=real` (por defecto en `npm run build`), el frontend le pide la sesión al backend con `GET /api/sesion`. La sesión vive en el servidor con cookie HttpOnly: el frontend no guarda tokens ni contraseñas.

## Estructura

```
src/
├─ core/                     compartido: se cambia de a dos, con revisión
│  ├─ config/
│  │  ├─ modulos.js          catálogo de módulos: tarjetas, rutas y quién los ve
│  │  ├─ areas.js            áreas (gerencias) de la plataforma
│  │  └─ permisos.js         qué módulos ve cada área (solo interfaz)
│  ├─ sesion/                usuario actual, usuarios y datos de prueba
│  ├─ tema/                  modo claro / oscuro
│  ├─ layout/                barra superior, barra de desarrollo y control de acceso a rutas
│  └─ componentes/           componentes reutilizables (tarjeta, chip, logo, etc.)
├─ assets/                   logo oficial de AUBASA
├─ estilos.css               estilo "Cristal": colores, vidrio y modo oscuro
├─ paginas/                  inicio, sin acceso, no encontrada
└─ modulos/                  un módulo por carpeta: cada responsable trabaja en la suya
   ├─ mantenimiento/
   ├─ rrhh/
   ├─ legales/
   ├─ finanzas/
   ├─ comercial/
   ├─ vencimientos/
   ├─ notificaciones/
   └─ sistemas/
```

## Cómo trabajar un módulo

1. Crear la rama desde `develop`, por ejemplo `feature/vehiculos`.
2. Trabajar dentro de `src/modulos/<módulo>/`. Su `index.jsx` es la pantalla principal del módulo y hoy muestra "en construcción".
3. Las subpantallas van en la misma carpeta. Para tener rutas internas (`/mantenimiento/vehiculos`), usar `<Routes>` dentro del `index.jsx`: la ruta del módulo ya acepta subrutas.
4. Si hace falta tocar algo de `core/`, avisar al otro: lo usan todos los módulos.

## Agregar un módulo nuevo

1. Crear `src/modulos/<id>/index.jsx`.
2. Agregar su entrada en `src/core/config/modulos.js` (nombre, descripción, áreas que lo ven, ícono y color).

La tarjeta, la ruta y el control de acceso salen solos de esa entrada.

## Diseño "Cristal"

Elegido entre cinco propuestas. Tarjetas y barras de vidrio esmerilado (`.vidrio` en `estilos.css`) sobre manchas de color de la marca, en la línea de Atención al Usuario y Mantenimiento Vial.

- Colores del Manual de Marca AUBASA v6: turquesa `#00aec3` institucional, rosa `#e81f76` solo como acento (globitos de pendientes), y la paleta complementaria para cada módulo.
- Cada módulo define su color en `modulos.js` (`acento`, y `acentoClaro` si es muy oscuro para el modo oscuro).
- Modo oscuro con el botón de la luna: agrega la clase `dark` a `<body>` y se recuerda en el navegador. Los colores que cambian viven en variables CSS.
- Para reutilizar el vidrio en una pantalla nueva alcanza con la clase `vidrio`.

Los números de los globitos y los avisos de arriba son datos de prueba (`core/sesion/datosDePrueba.js`) y solo aparecen en desarrollo, hasta que existan la bandeja (N-02) y los vencimientos (N-08).

## Permisos

`permisos.js` decide qué se **muestra**. No es seguridad: el backend valida cada pedido por rol y por objeto (regla 3.5 de la guía de desarrollo). Sistemas ve todos los módulos.

## Sin dependencias de internet

La tipografía (Encode Sans) y los íconos (lucide-react) quedan incluidos en el build. La aplicación no carga nada de CDNs ni servicios externos, porque corre solo en la intranet.
