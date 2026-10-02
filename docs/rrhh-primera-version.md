# RRHH: primera versión de interfaz

Implementación sobre `develop`, en `feature/rrhh`. Reutiliza navegación, sesión simulada, control de acceso por área y temas existentes. No modifica los módulos de Jorge.

## Alcance comprobable

| Historia | Comportamiento en la vista de prueba |
| --- | --- |
| R-01 | Búsqueda por nombre/legajo/DNI, filtro alta/baja, ficha e historial de estado del personal. |
| R-02 | Carga de licencia con múltiples categorías, fechas y archivo ficticio. Conserva versión y documento anteriores. |
| R-03 | Selector de fecha para consultar registro, categorías, documento y estado vigentes. |
| R-04 | Bandeja de multas; conductores y centro de costo a la fecha de infracción; confirmación explícita del responsable. |
| R-05 | Estado pendiente/pagada, fecha de pago y avisos/informes adjuntos. |
| R-06 | Otras multas del mismo vehículo o responsable confirmado. |
| Avisos | Resumen local de licencias vencidas/a 60 días y multas pendientes vencidas/a 15 días. No son alarmas automáticas ni el tablero transversal N-08. |

Fuentes: guía de desarrollo Matías/Jorge (reglas 3 y R-01 a R-06) y documento funcional final (3.1, RN-05/06/10/11/12). Los calendarios de sprints difieren entre documentos; esta entrega no modifica el cronograma. La autorización se muestra en consulta; el circuito de alta de Legales/revisión de Mantenimiento sigue separado de RRHH.

## Ejecutar y revisar

```bash
cd frontend
npm ci
npm run dev
node --test src/modulos/rrhh/dominio.test.js
```

En el selector **Ver como**, elegir **Bruno Díaz (RRHH)** o **Admin Sistemas**. Abrir Recursos Humanos. Los datos son ficticios y relativos a la fecha actual para mantener ejemplos vencidos y próximos.

Probar búsqueda sin resultados, ficha de Acosta y fecha anterior a su última renovación, carga de licencia con dos categorías y PDF ficticio, multa ACTA-DEMO-001 (centro de costo histórico Operaciones), confirmación de responsable y pago, y vista de vencimientos. Cambiar a Mantenimiento debe mostrar Sin acceso en `/rrhh`.

Netlify ya configura `VITE_AUTH_MODE=development`; para reproducir su build local:

```bash
VITE_AUTH_MODE=development npm run build
```

## Límites y próxima integración

- Es una interfaz funcional de demostración, no un módulo productivo. Personas, GLM, vehículos, asignaciones, autorizaciones y centros de costo se simulan.
- Los cambios y archivos viven exclusivamente en memoria; al salir del módulo o recargar se reinician. Los archivos no se envían a ningún servidor. Solo usar documentos ficticios.
- Los períodos son `[vigente_desde, vigente_hasta)`, con cierre exclusivo y una sola versión vigente. Se rechazan renovaciones anteriores o iguales a la última versión y fechas futuras; correcciones de la misma fecha requieren definición del flujo de corrección.
- Catálogo de categorías de prueba: reemplazar con el catálogo de Sistemas y confirmar sus códigos con el referente.
- Validación de archivos en navegador: PDF/JPG/PNG, máximo 10 MB y huella SHA-256. La API deberá validar contenido, permisos, almacenamiento/deduplicación, versiones y vínculos; no se implementa seguridad productiva en el cliente.
- El registro en memoria de acciones es solo apoyo de la demo. Falta auditoría transaccional del backend (antes/después, usuario, IP y request_id).
- En modo real no se muestra la demo; se indica que falta la API. No hay escritura a PostgreSQL, AD ni SQL Server.
- Sustituir `servicioDemo.js` por servicio API conservando las reglas en backend, autorización por rol/objeto y operaciones atómicas. No conectar GLM directamente desde el navegador.
- Las altas/bajas pertenecen a GLM o a la carga controlada de Sistemas mientras GLM no esté disponible; RRHH no las edita.
- El PR se dirige a `develop` para revisión cruzada antes del merge. La publicación en la rama de producción depende de la configuración existente de Netlify.
