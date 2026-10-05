# Decisiones técnicas

| Decisión | Estado | Motivo |
| --- | --- | --- |
| JavaScript como lenguaje principal | Confirmada | Elección del equipo |
| React para frontend | Confirmada | Elección del equipo |
| PostgreSQL para datos propios | Prevista | Modelo relacional propio |
| Framework de backend | Express (adoptada, F-05) | Simplicidad, ecosistema Node/JavaScript y adecuación para una API interna |
| Herramientas de frontend y versiones | Propuesta (feature/frontend-base) | Node 22 LTS, Vite 8, React 19, React Router 7, lucide-react (íconos) y Encode Sans incluida en el build. CSS propio sin framework, diseño "Cristal" (vidrio esmerilado, modo claro/oscuro) con la paleta del Manual de Marca v6. Sin dependencias de CDN |
| Herramienta de migraciones | Pendiente | Seleccionar junto con el backend |
| Monorepositorio | Adoptada | Código y documentación juntos |
| GitHub público | Confirmada | Preferencia del responsable |
| main, develop y feature/* | Adoptada | Organización del trabajo |
| Integraciones desacopladas y datos ficticios | Adoptada | Desarrollar sin servidor corporativo |
| Autenticación corporativa | Kerberos/SPNEGO seleccionado; conectividad validada | Integración web real pendiente de FQDN + SPN HTTP + keytab/identidad de servicio provistos por Infraestructura. Terminación SPNEGO por acordar. LDAPS queda como alternativa técnica; SSO web aún no implementado |
| Docker | Diferida | No bloquea el desarrollo |
| Sistema operativo y despliegue | Pendiente de Infraestructura | Servidor sin entregar |
| Licencia open source | Sin incorporar | No definida |

## Registro de cambios

Registrar nuevas decisiones con fecha, contexto, alternativa elegida y consecuencias. No presentar propuestas como implementaciones terminadas. Las instrucciones de instalación se incorporarán cuando existan dependencias y scripts reales.
