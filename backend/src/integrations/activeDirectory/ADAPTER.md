# Adaptador LDAP + GSSAPI

Implementación inicial de consultas LDAP autenticadas mediante SASL/GSSAPI. No registra rutas HTTP ni cambia AUTH_MODE, sesiones, PostgreSQL, Nginx o Docker.

## Requisitos antes de operar

- Infra debe confirmar que LDAP/389 con GSSAPI está autorizado como alternativa a LDAPS/636.
- Identidad técnica Kerberos, cache FILE dedicado y protegido y procedimiento de renovación. No utilizar credenciales ni ticket personales.
- Ubuntu con ldap-utils, módulo GSSAPI, DNS corporativo y Kerberos configurados.
- Probar compatibilidad de la capa de seguridad SASL en el entorno operativo.

## Funciones

- createGssapiDirectoryClient({ticketCache}).searchEmployees(term): busca usuarios habilitados, máximo 20 registros.
- createGssapiDirectoryClient({ticketCache}).findEmployeeByAccount(account): consulta coincidencia exacta.

El proceso usa ldapsearch sin shell y con argumentos separados; no recibe contraseñas en la línea de comandos. Verifica capa SASL negociada y falla cerrado ante errores.

## Pendientes

- Ejecutar suite npm test y CI.
- Verificar normalización de objectGUID binario, atributos requeridos y tratamiento de referrals.
- Integrar endpoint protegido por roles de Sistemas persistidos en PostgreSQL, con limitación de frecuencia y auditoría.
- Gestionar renovación del ticket y probar la conexión real con cuenta técnica aprobada.