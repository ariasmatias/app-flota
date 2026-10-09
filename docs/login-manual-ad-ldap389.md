# Acceso corporativo manual — App FLOTA

Decisión: **sin SSO**, formulario de usuario y contraseña corporativos. La validación se realiza contra AD usando `kinit` por solicitud y `ldapwhoami` por LDAP 389 con SASL/GSSAPI y capa de protección obligatoria. El backend no almacena la contraseña ni el ticket en PostgreSQL; el ticket se guarda en caché temporal separada y se elimina al terminar la solicitud.

## Estado de implementación

- UI React de login y conexión con `POST /api/sesion/login` implementadas en esta rama.
- Modo `AUTH_MODE=ldap-gssapi` habilitado **solo en development** para pruebas controladas; bloqueado en producción por falta de autorización en PostgreSQL, TLS y store persistente de sesiones.
- No se utilizó un LDAP simple bind sin cifrado.
- Para probar localmente la integración, el servidor Ubuntu debe contar con `/usr/bin/kinit` y `/usr/bin/ldapwhoami`, y acceso a Kerberos y LDAP.
- No ejecutar pruebas con credenciales reales por Nginx HTTP puerto 80 ni desde un navegador remoto: requiere HTTPS con frontera de proxy configurada y revisada.

## Bloqueantes para habilitar usuarios finales

1. Implementar autorización: `usuario` habilitado + roles y permisos en `FLOTAprod`, sin permitir acceso por credenciales AD válidas solamente.
2. TLS/HTTPS extremo navegador → proxy, y política estricta de proxy de confianza. No aceptar `X-Forwarded-Proto` arbitrario.
3. Sesiones persistentes (fuera del `MemoryStore` de desarrollo), política de bloqueo/rate limiting, auditoría sin contraseñas y control de CSRF.
4. Pruebas reales de AD sin registrar contraseñas, pruebas end-to-end de navegador y revisión de seguridad.
5. Pantalla de Sistemas para la habilitación manual (sin buscador LDAP) y asignación de roles.

La rama **no debe fusionarse para despliegue en producción** hasta cerrar estos requisitos.
