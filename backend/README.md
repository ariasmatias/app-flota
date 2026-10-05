# Backend

API base de App FLOTA con Express y JavaScript ES Modules. Incluye health check, respuestas JSON para rutas inexistentes y manejo central de errores. No implementa endpoints de módulos ni autenticación.

## Requisitos e instalación

Node.js >=22.12 y npm. Desde la raíz del repositorio:

```powershell
cd backend
npm install
npm run dev
```

`npm run dev` usa el modo watch nativo de Node (`node --watch`) para reiniciar al cambiar código. Para ejecutar sin recarga: `npm start`. Detener con Ctrl+C. Con el lockfile existente, `npm ci` permite reproducir la instalación.

## Health check

`GET http://localhost:3001/api/health` devuelve HTTP 200:

```json
{
  "ok": true,
  "service": "app-flota-backend",
  "environment": "development",
  "timestamp": "2026-10-05T12:00:00.000Z"
}
```

El timestamp es la fecha UTC de la respuesta. Indica que la API está activa; no comprueba PostgreSQL ni integraciones.

Una ruta inexistente devuelve HTTP 404 con `{"error":"Recurso no encontrado"}`. Los errores internos devuelven un mensaje genérico, sin stack, rutas, cuerpos de solicitudes ni secretos, en todos los ambientes. JSON mal formado devuelve 400; cuerpos demasiado grandes, 413.

## Configuración

dotenv lee exclusivamente el `.env` de la raíz del repositorio, independientemente del directorio de ejecución. Es opcional: se puede arrancar con los valores por defecto. Para personalizarlo, copiar manualmente `.env.example` a `.env` en la raíz y editarlo. Las variables del proceso tienen prioridad. Reiniciar el backend tras cambiar el entorno. No guardar credenciales ni `.env` en Git.

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| APP_ENV | development | Ambiente de ejecución |
| PORT | 3001 | Puerto HTTP, entero de 1 a 65535 |
| DB_HOST | localhost | Host reservado para PostgreSQL |
| DB_PORT | 5432 | Puerto reservado para PostgreSQL |
| DB_NAME | app_flota | Nombre reservado de base |
| DB_USER | vacío | Usuario opcional, todavía sin conexión |
| DB_PASSWORD | vacío | Contraseña opcional, todavía sin conexión |
| INTEGRATIONS_MODE | mock | Configuración reservada; no activa adaptadores |
| AUTH_MODE | development | Configuración reservada; no implementa autenticación |
| UPLOADS_DIR | ./uploads | Ruta reservada; no crea directorios ni habilita cargas |

CORS permite `http://localhost:5173` únicamente con `APP_ENV=development`. En los demás ambientes no habilita acceso entre orígenes; no usa comodín. CORS no sustituye autenticación. Helmet configura las cabeceras de seguridad y `express.json()` mantiene su límite predeterminado de 100 KB.

## Estructura y límites

`src/app.js` configura Express sin abrir un puerto; `src/server.js` inicia el proceso y maneja errores de arranque. La configuración está en `src/config/env.js`, el health check en `src/routes/` y los middlewares en `src/middleware/`.

PostgreSQL está confirmado, pero todavía no está conectado. No se exige usuario, contraseña ni base disponible. La conexión futura irá en `src/infrastructure/database/`; el esquema y las migraciones los trabaja Jorge y no se ejecutan al iniciar este backend.

AD, GLM y SQL Server se implementarán más adelante mediante adaptadores en `integrations/` de la raíz. Esta base funciona sin conexiones corporativas. No incluye Docker ni configuración de despliegue productivo.
