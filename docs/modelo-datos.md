# Modelo de datos preliminar

PostgreSQL almacenará los datos propios. Este documento es una propuesta; no existen tablas ni migraciones implementadas todavía.

| Entidad candidata | Relación o propósito |
| --- | --- |
| usuarios | Identidad funcional y referencia corporativa futura |
| roles / permisos | Autorización de la aplicación |
| usuarios_roles | Asignación de roles |
| vehiculos | Unidades de flota |
| conductores | Personas vinculadas a conducción |
| asignaciones | Relación vehículo/conductor con período |
| talleres | Talleres internos o externos |
| ordenes_trabajo | Referencia a vehículo y, cuando corresponda, taller |
| documentos | Información documental y vencimientos |
| adjuntos | Metadatos y referencia al almacenamiento |
| historial_estados | Transiciones con actor y fecha |
| eventos_auditoria | Operaciones relevantes y trazabilidad |

## Criterios

- Definir claves primarias, foráneas y restricciones por entidad.
- Acordar unicidad y normalización de patentes e identificadores externos.
- Definir campos obligatorios, estados válidos y política de bajas.
- Conservar fechas con zona horaria cuando representen instantes.
- Definir asociaciones de adjuntos manteniendo integridad referencial.
- Evitar duplicar datos corporativos sin acordar sincronización y fuente de verdad.
- Versionar cambios en migrations; no editar migraciones ya aplicadas.
- Usar únicamente datos ficticios en seed.

## Pendientes

Validar cardinalidades, elaborar diagrama entidad-relación, acordar campos y seleccionar herramienta de migraciones. Las primeras migraciones se crearán después de esa validación.
