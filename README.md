# Gestión de Flota — AUBASA

Aplicación web interna para centralizar la gestión de vehículos, personas, documentación, autorizaciones, mantenimiento y procesos asociados.

## Estado actual

Proyecto en desarrollo con **versión demostrativa operativa en la intranet de AUBASA**. La aplicación se publica desde un servidor Ubuntu administrado internamente; **Netlify ya no forma parte del despliegue**.

- **Frontend:** React + Vite; navegación y menú de módulos. En el servidor, el build estático lo sirve Nginx.
- **Backend:** Node.js + Express; API de salud y sesiones. Se mantiene en ejecución mediante systemd, detrás de Nginx.
- **Login de demostración:** ingreso y cierre de sesión funcionales con identidad ficticia, sin validar contraseñas de Active Directory.
- **Active Directory:** conexión Kerberos y LDAP 389 con GSSAPI comprobada desde Ubuntu; la autenticación corporativa desde el navegador **todavía no está habilitada**.
- **Base de datos:** PostgreSQL en Docker; el diseño de tablas y la autorización definitiva por usuario/rol siguen en revisión. No considerar aplicadas las migraciones solo porque existan en Git.
- **HTTPS:** pendiente para proteger las credenciales corporativas entre el navegador y la aplicación. No introducir contraseñas de AD en el sitio HTTP.

La interfaz puede mostrar pantallas de módulos demostrativos. Esto **no implica** que estén habilitadas las operaciones de negocio ni las integraciones con datos reales.

## Arquitectura

```text
Navegador (intranet)
    │
    ▼
Nginx ── archivos estáticos del frontend React
    │
    └── /api/ ──► Node.js / Express
                       ├── Sesiones de demostración
                       ├── Adaptador AD Kerberos + LDAP/GSSAPI (pendiente de activar)
                       └── PostgreSQL (integración y permisos pendientes)
```

Las credenciales, secretos y datos corporativos no deben incorporarse a GitHub ni a variables `VITE_` del frontend.

## Desarrollo local

Requiere Node.js 22.12 o superior y npm.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Abre `http://localhost:5173`. En el modo de desarrollo habitual usa usuarios y datos ficticios. Con `VITE_AUTH_MODE=real`, consulta la API de sesión del backend. Consultar [frontend/README.md](frontend/README.md).

### Backend

```bash
cd backend
npm ci
npm test
```

Para iniciar el backend hacen falta las variables de entorno locales necesarias, especialmente un `SESSION_SECRET` fuerte. Consultar [backend/README.md](backend/README.md) y los ejemplos de configuración. No subir archivos `.env` ni credenciales.

### Construcción de frontend

```bash
cd frontend
npm ci
npm run build
```

El resultado queda en `frontend/dist/`. La publicación en Nginx se realiza mediante el procedimiento de despliegue del equipo, no mediante Netlify.

## Estructura del repositorio

| Ruta | Contenido |
| --- | --- |
| `frontend/src/` | Interfaz React y módulos |
| `backend/src/` | API, sesiones y autenticación |
| `integrations/` | Documentación y adaptadores de integraciones |
| `database/migrations/` | Migraciones SQL versionadas |
| `database/seed/` | Datos ficticios |
| `docs/` | Arquitectura, relevamientos y decisiones |
| `.github/workflows/` | Pruebas automáticas de GitHub Actions |

## Trabajo con GitHub

- `main`: base estable del proyecto.
- `develop`: rama de integración.
- `feature/*`, `fix/*`, `chore/*`: ramas de trabajo.
- Flujo recomendado: rama de trabajo → pull request → `develop`, con revisión y comprobaciones automáticas.

Las pruebas de GitHub Actions se conservan: **no publican la aplicación**, sino que verifican las pruebas del backend y que el frontend compile.

## Próximos hitos

1. Completar los controles de seguridad y pruebas del login manual AD por Kerberos + LDAP 389/GSSAPI.
2. Proteger con HTTPS el acceso desde el navegador antes de usar credenciales corporativas.
3. Vincular usuarios y permisos al esquema aprobado de PostgreSQL cuando esté disponible.
4. Incorporar progresivamente funcionalidades de negocio e integraciones reales.

## Seguridad y documentación

El repositorio es público: subir únicamente código, documentación apta para difusión y datos ficticios. No incluir contraseñas, tokens, archivos `.env`, claves privadas, datos productivos ni detalles internos sensibles de infraestructura.

- [Arquitectura](docs/arquitectura.md)
- [Módulos](docs/modulos.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)

No se incorpora una licencia open source en esta etapa.
