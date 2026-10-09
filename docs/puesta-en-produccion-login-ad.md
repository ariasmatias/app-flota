# Puesta en producción del login manual — Gestión de Flota

Estado inicial comprobado al 09/10/2026: servidor Ubuntu 10.102.20.203, Nginx HTTP 80, backend Express en modo development, PostgreSQL 17 en Docker. Conectividad Kerberos (88) y LDAP (389) comprobada con credenciales individuales vía GSSAPI; el navegador **no** tiene HTTPS habilitado. Los datos de LDAP no se gestionan desde la web.

## Decisión de arquitectura

1. El empleado introduce su usuario y contraseña corporativos en el formulario de Gestión de Flota (sin SSO).
2. El navegador debe enviar las credenciales **solo por HTTPS**, nunca por HTTP en intranet; Nginx pasa la solicitud al backend local por canal restringido.
3. El backend obtiene por solicitud un ticket Kerberos efímero mediante `kinit`, comprueba LDAP en puerto 389 con SASL/GSSAPI y capa de seguridad, y destruye el cache temporal al terminar. No se guardan contraseñas de AD.
4. El backend consulta PostgreSQL: usuario corporativo **habilitado** y permisos asignados por Sistemas. Sin alta válida, respuesta 403 sin sesión. Ni siquiera credenciales de AD correctas bastan para ingresar.
5. Solo si ambas comprobaciones pasan, se crea una sesión HttpOnly/SameSite/Secure persistida en un store de producción, sin incluir contraseña ni ticket.

## Bloqueantes a resolver antes de usuarios reales

- [ ] HTTPS: DNS interno elegido y certificado confiable para el nombre publicado; Nginx escucha 443 y HTTP 80 redirige sin aceptar credenciales. Validar la frontera de confianza con el proxy.
- [ ] PostgreSQL: Pedro aprueba y aplica tablas de usuario, roles/permisos y auditoría; cuenta backend de privilegios mínimos (sin SUPERUSER); crear el primer administrador mediante alta controlada.
- [ ] Autorización: todas las rutas de información exigen sesión y permisos en backend; usuario deshabilitado o ausente no puede entrar; revalidación/revocación de sesiones según política.
- [ ] Sesiones: store persistente con expiración, regeneración en login, invalidación logout, cookies Secure, secreto fuerte fuera de Git.
- [ ] Defensa contra ataques: limitación de intentos por cuenta e IP, respuestas genéricas para evitar enumeración, auditoría sin almacenar contraseñas y control de CSRF.
- [ ] Pruebas: credenciales válidas/inválidas, cuenta AD deshabilitada, usuario FLOTA ausente/bloqueado, sesión expirada, reintentos, HTTP rechazado y pruebas desde navegador de intranet.
- [ ] Despliegue: revisar configuración de systemd/Nginx, levantar frontend compilado, `APP_ENV=production` y configuración backend verificable; plan de reversión.

## Orden recomendado

1. Revisar con Pedro las tablas de usuarios y roles sin modificar migraciones existentes ya ejecutadas; introducir migración versionada según estado real de FLOTAprod.
2. Implementar validación de habilitación y autorización en API con tests usando PostgreSQL aislado. Conservar bloqueo de modo corporativo en producción mientras falten controles.
3. Implementar el store persistente, controles de acceso y límites de autenticación.
4. Configurar HTTPS y despliegue; ejecutar pruebas integrales y recién entonces quitar el bloqueo de producción tras revisión.

**No desplegar el PR de login directamente como acceso a usuarios reales sin completar esta lista.**
