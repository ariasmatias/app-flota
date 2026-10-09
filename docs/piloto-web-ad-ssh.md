# Piloto web de login AD — solo túnel SSH

Este procedimiento valida el formulario React contra el backend `ldap-gssapi` en el puerto 3002, **sin modificar** la app de Nginx en `http://10.102.20.203`. **No es un despliegue productivo.**

## Requisitos

- La rama de esta funcionalidad debe estar incorporada al checkout de Ubuntu.
- Backend en `127.0.0.1:3002`, con `AUTH_MODE=ldap-gssapi`, `APP_ENV=development` y lista `AD_DEMO_ALLOWED_USERS` cerrada.
- El backend lee `.env` de la raíz; las variables del piloto pueden sobrescribirse **en el proceso** sin editar el archivo del backend principal.
- Mantener la app de producción en 3001 intacta.

## Frontend de piloto, servidor Ubuntu (terminal 1)

```bash
cd /opt/app-flota/app-flota/frontend
VITE_AUTH_MODE=real FLOTA_AD_PILOT=1 npm run dev -- --host 127.0.0.1 --strictPort
```

El proxy Vite de esta modalidad usa únicamente `127.0.0.1:3002`. **No utilizar `--host 0.0.0.0` ni abrir 5173 en el firewall.**

## Windows (terminal PowerShell 2)

```powershell
ssh -o ExitOnForwardFailure=yes -N -L 5173:127.0.0.1:5173 liriart@10.102.20.203
```

Abrir **`http://localhost:5173`**, no la IP corporativa. El túnel SSH protege el trayecto entre Windows y Ubuntu; Vite y Node solo se comunican por loopback en el servidor. Los navegadores consideran `localhost` un contexto seguro para esta prueba.

No utilizar para empleados, teléfonos, otras PCs o acceso público. El backend de piloto debe permanecer vinculado solo a loopback y no debe incluir rutas con datos reales.

## Prueba

1. `GET /api/sesion/modo` debe responder `{"modo":"corporativo"}`.
2. Probar el formulario con una **cuenta de piloto expresamente autorizada**, y después cerrar sesión.
3. Una contraseña incorrecta debe rechazarse y no crear sesión.
4. Una cuenta válida de AD pero fuera de la allowlist debe rechazarse.
5. No registrar ni copiar contraseñas en la terminal, chat o capturas.

## Advertencia

El piloto es una **excepción de desarrollo aislada** para comprobar el flujo end-to-end. La publicación interna mediante IP requiere HTTPS confiable, sesiones persistentes, control de intentos, registro seguro de eventos y autorización de acceso a datos antes de aceptar credenciales desde cualquier navegador de la intranet.
