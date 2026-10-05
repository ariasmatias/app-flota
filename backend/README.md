# Backend

API de App FLOTA con Express y JavaScript ES Modules. Incluye health check, sesión propia del lado servidor, autenticación ficticia controlada para desarrollo, respuestas JSON y manejo central de errores. Kerberos/SPNEGO está seleccionado, pero la autenticación corporativa web todavía NO está implementada.

## Requisitos e instalación

Node.js >=22.12 y npm. Desde la raíz del repositorio:

```powershell
cd backend
npm install
# Secreto efímero para esta terminal PowerShell; no lo imprime ni lo guarda en Git.
$env:SESSION_SECRET = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
npm run dev
```

`npm run dev` usa el modo watch nativo de Node (`node --watch`) para reiniciar al cambiar código. Para ejecutar sin recarga: `npm start`. Detener con Ctrl+C. Con el lockfile existente, `npm ci` permite reproducir la instalación.

Para verificar: `npm test` (runner nativo de Node, sin framework adicional) y `npm audit`. Generar un secreto nuevo invalida las cookies anteriores. En Bash se puede iniciar con `SESSION_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")" npm run dev`.

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

dotenv lee exclusivamente el `.env` de la raíz del repositorio, independientemente del directorio de ejecución. El archivo es opcional, pero `SESSION_SECRET` es obligatorio desde el entorno o desde ese archivo, también en development. Para personalizarlo, copiar manualmente `.env.example` a `.env` en la raíz y completar un secreto aleatorio local. Las variables del proceso tienen prioridad. Reiniciar el backend tras cambiar el entorno. No guardar credenciales ni `.env` en Git. Nunca usar una contraseña de dominio como secreto de sesión.

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
| AUTH_MODE | development | development o kerberos; sin fallback entre proveedores |
| SESSION_SECRET | sin valor; obligatorio | Secreto aleatorio de al menos 32 bytes; nunca se genera un valor predeterminado en el servidor |
| SESSION_IDLE_MINUTES | 30 | Inactividad máxima en minutos enteros, entre 1 y 1440 |
| SESSION_COOKIE_SECURE | false en development; true fuera | Solo acepta true/false. Fuera de development se rechaza false; requiere HTTPS |
| UPLOADS_DIR | ./uploads | Ruta reservada; no crea directorios ni habilita cargas |

CORS permite `http://localhost:5173` con credenciales únicamente con `APP_ENV=development`. En los demás ambientes no habilita acceso entre orígenes; no usa comodín. CORS no sustituye autenticación. Helmet configura las cabeceras de seguridad y `express.json()` mantiene su límite predeterminado de 100 KB. No se habilita `trust proxy`: la topología y la confianza en proxies se definirán al integrar Infraestructura.

## Autenticación y sesión (I-01, implementación parcial)

`src/auth/authProvider.js` separa dos contratos: `authenticate()` sin argumentos para el usuario ficticio de desarrollo, y `authenticateHttp(req, res)` reservado para la futura negociación corporativa. Ambos proveedores tienen `assertReady()` para impedir el arranque con un mecanismo no disponible. No se confía actualmente en ninguna cabecera de identidad, `Authorization`, ticket ni usuario enviado por el cliente.

- `AUTH_MODE=development` funciona exclusivamente con `APP_ENV=development`. Devuelve una identidad ficticia fija: `development-user` / `usuario.desarrollo` / `Usuario de desarrollo`. El navegador no elige la identidad. `area` queda en `null`: los roles por área y permisos corresponden a I-02 y no se asignan aquí.
- `AUTH_MODE=kerberos` falla al arrancar con salida 1 y un mensaje controlado que indica que SPNEGO web no está integrado. No acepta tickets sin verificarlos, no simula autenticación ni recurre al modo development. Ni siquiera un secreto válido habilita Kerberos: falta implementar el adaptador real una vez acordada la infraestructura.
- `SESSION_SECRET` sigue siendo obligatorio también en desarrollo. Se comprueba una longitud mínima de 32 bytes UTF-8, descontando espacios en los extremos; no se cuentan caracteres distintos ni se intentan detectar patrones para estimar entropía. Una cadena larga y predecible puede pasar la validación y seguir siendo insegura. Generar siempre con un generador criptográfico como en el ejemplo anterior (32 bytes aleatorios codificados como 64 caracteres hexadecimales). No usar frases, contraseñas ni ejemplos de tests como secretos reales.

Se utiliza [express-session](https://expressjs.com/en/resources/middleware/session/). La cookie `flota.sid` lleva únicamente un identificador firmado; la identidad y el vencimiento quedan en el servidor. La cookie es HttpOnly, SameSite=Lax, sin Domain y con Path=/api. `Secure` es obligatorio fuera de development. Se regenera el identificador al autenticar para evitar fijación de sesión. Las respuestas de sesión incluyen `Cache-Control: no-store`.

El vencimiento del store es la fuente de verdad de la inactividad. La cookie se renueva mediante `rolling: true`; el store renueva su vencimiento con `touch`, sin reescribir la identidad. Se eliminó `lastActivity` de la sesión: modificarlo en cada request podía provocar una escritura tardía después del logout. `/api/health` no carga ni renueva sesiones. Un cliente que consulte continuamente `/api/sesion` cuenta como activo; no equivale a medir movimientos del usuario en la pantalla. Si una sesión expira, `get` del store no la devuelve y `/api/sesion` responde 401. Reiniciar el proceso pierde todas las sesiones de desarrollo.

El store predeterminado es MemoryStore y se permite SOLO en development: no es persistente, no sirve para producción ni para múltiples procesos. `createApp({ config, sessionStore })` permite inyectar después otro store compatible con express-session. Fuera de development se rechazan el store omitido y MemoryStore. En todos los ambientes se exige que el store implemente `touch`. No se instala Redis, no se conecta PostgreSQL ni se crean tablas.

### Invalidación y contrato obligatorio del futuro store

`establishSession(req, identity)` es la única escritura completa de la sesión: después de autenticar, regenera el SID y guarda la identidad en el identificador NUEVO. Las consultas no modifican `req.session` ni guardan snapshots. Logout ejecuta `destroy` y espera su confirmación antes de responder y limpiar la cookie. Una consulta que estaba en curso solo puede terminar con `touch`; si el SID fue destruido o expiró, esa operación no lo crea nuevamente.

Una respuesta ya autorizada antes del logout puede finalizar después e incluso llevar una cookie antigua. Eso no revierte la invalidación: volver a usar ese SID da 401. Cerrar sesión no cancela retroactivamente solicitudes ya autorizadas ni impide una autenticación nueva y explícita con otro SID.

Un store externo DEBE cumplir estas condiciones, verificadas por tests de integración al elegirlo:

1. `get(sid)` devuelve únicamente sesiones existentes y no vencidas; la expiración debe comprobarse aunque la limpieza física de registros sea diferida.
2. `touch(sid, session)` actualiza exclusivamente el vencimiento de un registro existente y vigente. La comprobación y actualización deben ser atómicas respecto de `destroy` y del vencimiento. Nunca debe crear, hacer upsert, guardar un snapshot completo ni revivir un SID vencido. Una operación retrasada no debe reducir un vencimiento más reciente.
3. `destroy(sid)` invalida el registro de forma compartida entre todas las instancias; su callback confirma la invalidación efectiva. Lecturas iniciadas después de esa confirmación no pueden recuperar identidad desde una caché obsoleta.
4. `set` se usa solo para crear una sesión recién autenticada, con SID regenerado, y confirma la escritura antes de enviar la cookie. No agregar escrituras completas a sesiones existentes para preferencias, contadores o actividad. Si más adelante fueran necesarias, el store deberá añadir actualización condicional/revocación persistente que impida que una escritura pendiente recree un SID invalidado; esta garantía no se consigue con `resave: false` por sí solo.

La presencia de un método `touch` puede validarse al arrancar; su atomicidad no puede inferirse de su nombre. No habilitar un adaptador productivo hasta verificar su implementación y la prueba de concurrencia. La regresión automatizada actual retiene la renovación de una consulta autenticada, ejecuta logout, libera la operación pendiente y comprueba registro ausente y cookie antigua rechazada.

### Contrato HTTP reservado para SPNEGO (sin implementación real)

`authenticateHttp(req, res)` devolverá uno de dos resultados: `{ kind: 'authenticated', identity }` después de verificar completamente una identidad, o `{ kind: 'handled' }` cuando el adaptador haya terminado la respuesta HTTP y la negociación deba continuar en otra solicitud o haya sido rechazada.

- **SPNEGO en Node:** el adaptador podrá emitir `401` con `WWW-Authenticate: Negotiate`, procesar `Authorization: Negotiate ...` y realizar varios intercambios. También podrá establecer la cabecera final de autenticación mutua antes de devolver una identidad verificada. Los tokens nunca se incluyen en el JSON público, en la sesión propia ni en logs. El estado transitorio de negociación, si fuese necesario, será limitado y separado de la sesión autenticada.
- **SPNEGO en Nginx/proxy:** el adaptador solo podrá devolver identidad después de comprobar la frontera de confianza acordada: acceso al backend restringido al proxy, canal protegido, eliminación/sustitución de cabeceras de identidad suministradas por el cliente y validación del emisor. La presencia de una cabecera por sí sola no autentica. No se elige aún nombre de cabecera ni configuración de proxy.

El futuro middleware corporativo se montará después de cargar la sesión y antes de las rutas. Si hay sesión válida continúa; con `handled` no continúa ni crea sesión; con `authenticated` usa `establishSession` y continúa. Así se conservan GET de sesión, logout y almacenamiento, y la negociación se resuelve en el adaptador. Ese middleware NO existe todavía: el proveedor Kerberos continúa bloqueando el arranque, sin desafíos ficticios ni fallback. `POST /api/sesion/login` queda fuera del flujo corporativo y nunca recibirá usuario/contraseña de dominio.

## Endpoints de sesión

| Método y ruta | Resultado |
| --- | --- |
| `POST /api/sesion/login` | Solo existe con APP_ENV=development Y AUTH_MODE=development; crea sesión ficticia fija. En cualquier otra combinación la ruta no se registra (404 si se prueba el router aislado) |
| `GET /api/sesion` | 200 con identidad si hay sesión; 401 `{"error":"No autenticado"}` si no la hay |
| `POST /api/sesion/logout` | Destruye la sesión y limpia la cookie; 200 `{"ok":true}` |

Los POST de sesión requieren la cabecera `X-Flota-Session: 1`. No es un secreto, no autentica y no permite elegir usuario. Es una defensa CSRF que funciona junto con SameSite, CORS restringido y la comprobación de origen: impide POST desde formularios externos y exige preflight para peticiones JavaScript entre orígenes. El frontend futuro deberá enviarla en login de desarrollo y logout; el GET actual no la necesita. Se rechazan solicitudes de orígenes ajenos o marcadas como cross-site (403). Errores del proveedor devuelven 503 genérico, sin datos internos. No se registran cookies, cabeceras Authorization, tickets, contraseñas ni secretos. Logout solo cierra App FLOTA, nunca la sesión Windows/Kerberos; un futuro acceso corporativo podría iniciar una negociación nueva.

El frontend existente ejecuta `.then(setUsuario)`, por lo que la respuesta 200 es directamente:

```json
{
  "id": "development-user",
  "usuario": "usuario.desarrollo",
  "nombre": "Usuario de desarrollo",
  "area": null
}
```

No se agrega un envoltorio `autenticado/usuario`. No se modifica el frontend ni sus módulos. Con `VITE_AUTH_MODE=development`, su simulador local continúa funcionando de forma independiente; para probar la sesión del backend usar `VITE_AUTH_MODE=real`. El frontend actual no tiene una acción de login/logout: el flujo puede probarse desde la consola del navegador en el origen de Vite, sin cambiar la UI:

```javascript
// Login ficticio controlado, solo con backend en development.
await fetch('/api/sesion/login', {
  method: 'POST', credentials: 'include', headers: { 'X-Flota-Session': '1' }
});
// Recargar para que SesionContext consulte la cookie HttpOnly.
location.reload();
// Consulta manual:
await fetch('/api/sesion', { credentials: 'include' }).then(r => r.json());
// Logout (y después recargar la interfaz para quitar su identidad en memoria):
await fetch('/api/sesion/logout', {
  method: 'POST', credentials: 'include', headers: { 'X-Flota-Session': '1' }
});
```

El backend vuelve a rechazar la cookie anterior tras logout. No hay rediseño ni manejo nuevo de expiración en la UI en esta etapa.

## Pendiente de Infraestructura para Kerberos web real

La validación corporativa informada cubre detección de AD, DNS interno, puertos Kerberos/LDAP/LDAPS, krb5-user, obtención de TGT mediante kinit y sincronización horaria. No se volvió a conectar al servidor ni se modificó su configuración durante esta tarea. Obtener un TGT con kinit no prueba SSO HTTP. LDAPS queda como alternativa técnica.

Se necesitan estos datos y acuerdos, sin pedir contraseñas de dominio:

1. FQDN definitivo y publicación DNS de App FLOTA; URL HTTPS y certificado de confianza para servir cookies Secure fuera de development.
2. SPN HTTP correspondiente al FQDN, su registro y asociación a la identidad de servicio autorizada por Infraestructura, sin duplicados.
3. Keytab/identidad de servicio o mecanismo corporativo equivalente, con entrega segura, ubicación autorizada, permisos y procedimiento de renovación. Ningún material secreto debe ir al repositorio o al chat.
4. Decisión de dónde terminar SPNEGO (Node o proxy corporativo). Si es proxy, definir canal protegido, acceso restringido al backend y cómo entrega una identidad comprobada, sin permitir suplantación desde el navegador. Esto también determina cómo tratar HTTPS detrás del proxy.
5. Confirmación de clientes/navegadores habilitados para autenticación integrada contra esa URL y un escenario de prueba con una cuenta autorizada; no se solicita su contraseña.

Para operación fuera de development también se deberá acordar e implementar un store de sesiones persistente/compartido y la provisión/rotación de `SESSION_SECRET`. Son requisitos operativos adicionales a Kerberos; no se instala infraestructura en esta historia.

No se asume ni ejecuta realm join. No se crean SPN, cuentas, keytabs, certificados ni configuración de Nginx/Docker/DNS. El SSO web real, el adaptador de confianza, el store productivo y los roles I-02 siguen pendientes.

## Estructura y límites

`src/app.js` configura Express sin abrir un puerto; `src/server.js` inicia el proceso y maneja errores de arranque. La configuración está en `src/config/env.js`, el health check en `src/routes/` y los middlewares en `src/middleware/`.

PostgreSQL está confirmado, pero todavía no está conectado. No se exige usuario, contraseña ni base disponible. La conexión futura irá en `src/infrastructure/database/`; el esquema y las migraciones los trabaja Jorge y no se ejecutan al iniciar este backend.

La verificación corporativa real se conectará mediante adaptadores de `integrations/` de la raíz detrás del contrato de `src/auth/`. GLM y SQL Server siguen pendientes. El modo development funciona sin conexiones corporativas. No incluye Docker ni configuración de despliegue productivo.
