# Datos de prueba

Solo datos **ficticios** y reproducibles. Nunca copiar datos productivos.

| Archivo | Qué hace |
| --- | --- |
| `001_datos_demo.sql` | Carga ~20 filas por tabla en las 34 tablas, coherentes entre sí. |
| `900_borrar_datos_demo.sql` | Vacía **todas** las tablas y reinicia los id. No toca la estructura. |
| `910_verificar_datos_demo.sql` | Controles de coherencia. Solo lee. |

## Cómo se usan

```bash
# 1. Base con las tablas creadas (ver database/migrations/README.md)
# 2. Cargar los datos de prueba
psql -h localhost -U flota_app -d flota -v ON_ERROR_STOP=1 -f database/seed/001_datos_demo.sql
# 3. Revisar que estén coherentes
psql -h localhost -U flota_app -d flota -f database/seed/910_verificar_datos_demo.sql
# Volver a empezar: borrar y cargar de nuevo
psql -h localhost -U flota_app -d flota -v ON_ERROR_STOP=1 -f database/seed/900_borrar_datos_demo.sql
```

**Producción:** se corren solo las migraciones. Si el servidor se armó con datos de prueba, antes de conectar GLM y cargar datos reales se corre `900_borrar_datos_demo.sql`. Revisar siempre en qué base se está.

## Qué hay

- **Todo inventado:** legajos `DEMO-001`…`DEMO-020`, DNI `DEMO-…`, dominios serie `ZZ`, correos `@demo.invalid`, actas `ACTA-DEMO-…`, pólizas `POL-DEMO-…`, tarjetas `DEMO-7000-…`, centros de costo `CC-DEMO-…`, autopistas "Autopista Ejemplo …".
- **Fechas relativas al día de carga** (`CURRENT_DATE ± días`): siempre hay ejemplos vigentes, por vencer y vencidos.
- **Mismo elenco que las demos del frontend:** las personas 1–5, los vehículos 1–5, las pólizas y las 3 primeras multas coinciden con `servicioDemo.js` de RRHH y Mantenimiento. Los usuarios 1–6 son los de "Ver como".
- **Reglas respetadas:** toda asignación vigente cumple persona de alta, licencia vigente con la categoría del vehículo y autorización "si", salvo el caso de prueba de abajo. Un solo período vigente por entidad; sin superposiciones.

## Casos de prueba a propósito

| Caso | Dato |
| --- | --- |
| Asignación con problemas | Costa (DEMO-003) conduce AA002ZZ con licencia vencida y autorización pendiente |
| Bajas de personal | Duarte (DEMO-004, hace 20 días) y Suárez (DEMO-018), con asignaciones cerradas |
| Autorizaciones | Estévez (DEMO-005) y Torres (DEMO-019) pendientes; Juárez (DEMO-010) rechazada |
| Licencias | Benítez vence en 18 días, Ledesma en 25; Paz (DEMO-015) sin B.1; Torres sin licencia |
| Vehículos | AB004ZZ y AA015ZZ en taller; AA005ZZ y AA019ZZ de baja; AA020ZZ 0 km sin póliza ni VTV |
| VTV | Vencidas AA003ZZ y AA013ZZ; por vencer AA002ZZ (12 días) y AA009ZZ (20 días) |
| Pólizas | POL-DEMO-0002 vence en 25 días; renovación de POL-DEMO-0003 → 0004 |
| Ficha por fecha | AA001ZZ cambió de centro de costo hace 10 días y de póliza hace un año |
| Tarjetas YPF | La de AA005ZZ dada de baja, la de AB004ZZ bloqueada, la de AA016ZZ sin número |
| Consumos | 40 líneas en 4 facturas; 4 sin producto identificado (FI-12) |
| GLM | 21 movimientos procesados y un alta (DEMO-021) sin procesar |

## Limitaciones mientras se cierran las consultas del esquema

- `pin` guarda valores al azar en texto, como pide el esquema v1.0 (pendiente: guardarlo protegido).
- Una sola tarjeta operativa por vehículo, por el índice único actual de `tarjeta`.
- `tag.estado_tag` usa los códigos del catálogo como texto.
- `aviso_enviado.evento` indica la entidad como `tabla:id`, porque no hay columna para eso.
- `documento_version` tiene hashes de ejemplo; no hay archivos en disco.

Si el esquema cambia, se ajusta el seed en el mismo Pull Request de la migración nueva.
