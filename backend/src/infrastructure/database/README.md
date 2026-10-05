# PostgreSQL

PostgreSQL es la base propia confirmada del sistema. La conexión aún no está implementada: el backend puede arrancar sin base disponible ni credenciales.

La configuración lee las variables `DB_*` de la raíz para su uso futuro. Este directorio alojará la conexión cuando se acuerde con el responsable del esquema. No incluye ORM, consultas simuladas ni migraciones; el esquema se mantiene en `database/migrations/` bajo el trabajo de Jorge.
