# Acceso demostrativo de Gestión de Flota (sin tablas de autorización)

El login real de AD utiliza Kerberos + LDAP 389 con SASL/GSSAPI. Este cambio añade una **lista cerrada, explícita y temporal** de usuarios corporativos autorizados para la demo. Ninguna cuenta AD no incluida podrá iniciar sesión; una cuenta autorizada verá solo menú y pantallas sin operaciones reales.

## Variables de entorno del backend

- `APP_ENV=development` y `AUTH_MODE=ldap-gssapi` (modo demo temporal, no productivo).
- `AD_DEMO_ALLOWED_USERS=cuenta1,cuenta2` — usuarios `sAMAccountName` sin dominio, separados por coma. **Nunca incluyas contraseñas**. Sin esta variable el backend rechaza el arranque en modo LDAP demo.
- `SESSION_SECRET` aleatorio (no poner en Git).

## Límites de seguridad

- El servidor actual solo publica HTTP 80. **No ingresar credenciales reales** desde el navegador hasta configurar HTTPS válido y probar la autenticación segura extremo a extremo.
- El middleware actual rechaza el formulario LDAP desde HTTP de la red. El túnel de Vite sirve para visualizar el formulario, **no para operar con contraseñas corporativas**.
- `APP_ENV=production` con `AUTH_MODE=ldap-gssapi` permanece bloqueado hasta implementar autorización en base de datos, sesiones persistentes, HTTPS, rate limiting y controles de seguridad.
- Esta lista es solo un paso transitorio. Luego se sustituye por `usuario` + `rol` + `permiso` en PostgreSQL, sin modificar la autenticación de AD.
- Las tarjetas del menú no autorizan operaciones: la navegación de demo muestra una leyenda en lugar de las pantallas reales de los módulos.

## Dependencia adicional

Antes de probar autenticación LDAP/GSSAPI completar la corrección de `ldapwhoami` de PR #23 (remueve la opción `-Q` incompatible con la comprobación de protección SASL).
