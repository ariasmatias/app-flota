# RRHH y los datos de prueba compartidos

La fuente de prueba de RRHH es `database/seed/001_datos_demo.sql`, el mismo archivo que se carga en PostgreSQL. `servicioDemo.js` lo importa como texto a través de Vite y `leerSeed.js` adapta únicamente las tablas requeridas por RRHH. No existe otra lista local de personas, vehículos, licencias ni multas.

Incluye las 20 personas y vehículos y las 20 multas, categorías del catálogo, autorizaciones, estados, asignaciones, centro de costo por fecha y documentos de ejemplo vinculados en el seed. Conserva Costa vencida, Duarte/Suárez de baja, Juárez rechazado, Paz sin B.1 y Torres sin licencia. Las fechas `CURRENT_DATE ± días` se interpretan relativas al día local de apertura del módulo.

El lector solo admite INSERT VALUES estáticos con números, texto, booleanos, NULL y fechas relativas; no ejecuta SQL. Ignora timestamps de creación y el hash SQL calculado de documentos. Un formato nuevo en las columnas usadas falla explícitamente y requiere adaptar el lector y sus pruebas. No se altera el SQL de Jorge.

Los documentos del seed no tienen archivos reales: se muestra su nombre y la leyenda “sin archivo”. La consulta histórica respeta también la vigencia de sus versiones; no inventa documentos para las licencias que no los tienen.

## Verificación

```bash
cd frontend
node --test src/modulos/rrhh/*.test.js
VITE_AUTH_MODE=development npm run build
```

Se verifican cantidades, datos frente al seed, fechas relativas, casos de prueba, centros históricos, responsables de todas las multas y reglas previas de renovación/pagos.

## Estado de la conexión

Esto unifica la fuente de datos ficticios. El navegador sigue trabajando en memoria: los cambios se reinician al salir del módulo o recargar y no se sincronizan con Mantenimiento ni con una base instalada. Para operar sobre la misma BD real falta el backend/API y PostgreSQL compartido. La demo no se conecta directamente a PostgreSQL.

El esquema 001 permanece borrador para pruebas, con los pendientes documentados por Jorge. Esta integración no lo instala en un servidor ni ejecuta el script 900 de borrado.
