# Migraciones

Cambios versionados de la estructura de PostgreSQL. Se corren **en orden** y **una sola vez** por base. Una migración ya aplicada **no se edita**: todo cambio posterior va en un archivo nuevo con el número siguiente (`002_…`, `003_…`).

| Archivo | Qué hace | Estado |
| --- | --- | --- |
| `001_esquema_inicial.sql` | Las 34 tablas del esquema v1.0 de Mariano (`AUBASA_Esquema_Base_Datos_Jorge.pdf`) | **Borrador para pruebas.** Hay consultas abiertas con Mariano (PIN, índice de `tarjeta`, `tag.estado_tag`, `aviso_enviado`, `documento_vinculo`). No correr en el servidor hasta cerrarlas. |

`persona`, `persona_estado` y `sync_glm` son **provisorias** hasta conocer el formato real de GLM.

Herramienta de migraciones: pendiente de acordar (propuesta: Knex). Mientras tanto se corren con `psql`.

## Crear la base (local o servidor)

El usuario de la aplicación tiene que ser **dueño** de la base. Con `GRANT ALL ON DATABASE` solamente, PostgreSQL 15 o superior rechaza crear tablas (`permission denied for schema public`).

```sql
-- como postgres:  sudo -u postgres psql
CREATE USER flota_app WITH PASSWORD 'una-clave-segura';
CREATE DATABASE flota OWNER flota_app;
```

```bash
psql -h localhost -U flota_app -d flota -v ON_ERROR_STOP=1 -f database/migrations/001_esquema_inicial.sql
```

Para cargar datos de prueba, ver `database/seed/README.md`.
