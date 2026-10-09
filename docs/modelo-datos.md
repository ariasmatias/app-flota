# Modelo de datos

PostgreSQL guarda los datos propios de la plataforma. El personal sale de GLM.

## Estado actual

| Pieza | Dónde | Estado |
| --- | --- | --- |
| Esquema v1.0 (34 tablas) | `database/migrations/001_esquema_inicial.sql` | Borrador cargado tal como lo entregó Mariano. Probado en PostgreSQL 16. |
| Datos de prueba | `database/seed/` | Ficticios, ~20 filas por tabla. Ver `database/seed/README.md`. |
| Migración 002 | — | **No hecha.** Espera la guía de base de datos v1.2 (Pedro y Mariano). |
| Conexión del backend | — | Pendiente (F-03, segunda parte). |

Tablas de la v1.0, por área:

- **Personal y licencias:** `usuario`, `persona`, `persona_estado`, `categoria_licencia`, `licencia`, `licencia_categoria`, `autorizacion_conducir`, `sync_glm`.
- **Vehículos:** `vehiculo`, `vehiculo_estado`, `asignacion`, `poliza`, `poliza_vehiculo`, `vtv`, `multa`.
- **Finanzas:** `centro_costo`, `vehiculo_finanzas`, `perfil`, `producto`, `pin`, `tarjeta`, `tarjeta_periodo`, `consumo`.
- **Comercial:** `autopista`, `tag`, `tag_autopista`, `estado_tag`.
- **Documentos y avisos:** `tipo_documento_catalogo`, `documento`, `documento_version`, `documento_vinculo`, `notificacion`, `aviso_enviado`.
- **Auditoría:** `auditoria_evento`.

## Reglas que valen para todas las tablas

- Períodos `[vigente_desde, vigente_hasta)`: el cierre pertenece al período siguiente. Una sola fila vigente por entidad.
- Nada se borra: se cierra con fecha o se anula, con motivo.
- Las referencias usan el id interno, nunca el dominio ni el legajo (se pueden corregir sin romper nada).
- Toda escritura deja un registro en `auditoria_evento`, en la misma transacción.
- Los archivos se guardan por hash SHA-256 (D-01).
- En el repo y en los datos de prueba, **solo datos ficticios**. Los datos reales (planilla de flota, centros de costo) se importan en el servidor (P-01), nunca desde el repo.

## Cambios acordados para la migración 002 (08/10/2026)

Salen de las respuestas de Mariano del 08/10 y de su documento "Flota: campos para el diseño de pantallas" (v1.0). Detalle de pantallas en `docs/vehiculos-m01-ampliado.md`.

| Tabla | Cambio |
| --- | --- |
| `vehiculo` | Suma `anio`, `nro_chasis` (único entre vehículos que siguen en la flota), `nro_motor`, `clase_flota` (operativa / ejecutiva), `fecha_alta`, `fecha_baja`, `motivo_baja`, `nota_baja`. |
| `vehiculo_estado` | Solo `activo` y `taller`. **La baja deja de ser un estado:** es la fecha de baja del vehículo. |
| `gerencia` (nueva) | Catálogo de gerencias. `centro_costo.gerencia` (texto) pasa a `gerencia_id`. |
| `vehiculo_finanzas` | Suma `gerencia_id`. Se propone la del centro de costo, pero puede ser otra (no es error). |
| `jefatura` y `vehiculo_jefatura` (nuevas) | Catálogo de jefaturas por gerencia; un vehículo puede tener varias, con historial. |
| `categoria_licencia` | Cargar las 22 subclases oficiales en la migración (hoy están solo en el seed). |
| `pin` | PIN cifrado de forma reversible (Finanzas lo tiene que poder ver). La clave va en la configuración del servidor. |
| `tarjeta` | Sacar el índice único por vehículo: al dar de baja una tarjeta se puede pedir otra. Una sola vigente por vehículo. |
| `tag` | `estado_tag` pasa a `estado_tag_id` con referencia al catálogo (lo carga Comercial). |
| `aviso_enviado` | Suma `entidad` y `entidad_id`, con índice único, para que el proceso diario no repita avisos. |
| `documento_vinculo` | Suma `vigente_desde` y `vigente_hasta`. |

Pendientes que pueden sumar cambios: tabla de estados de gestión de multas (`multa_gestion`, la manda RRHH), formato de GLM, guía v1.2.

## Mientras tanto, en el frontend

Las pantallas ya usan los campos nuevos de vehículo con valores ficticios armados en `frontend/src/core/datos/vehiculoProvisorio.js`, con los mismos nombres de la tabla de arriba. Cuando exista la migración 002, ese archivo se borra y los datos salen del seed o de la API.
