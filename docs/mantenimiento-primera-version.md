# Mantenimiento: primera versión de interfaz

Implementación sobre `develop`, en `feature/mantenimiento`. Sigue el mismo molde que RRHH (`docs/rrhh-primera-version.md`): reglas puras en `dominio.js` con pruebas, datos ficticios en `servicioDemo.js` y pantallas en React. No modifica `core/` ni el módulo de RRHH.

Los nombres de tablas y columnas son los del esquema de base v1.0 (`AUBASA_Esquema_Base_Datos_Jorge.pdf`): `vehiculo`, `vehiculo_estado`, `asignacion`, `poliza`, `poliza_vehiculo`, `vtv`, `autorizacion_conducir`, `vehiculo_finanzas`. Así la API y las migraciones (F-03) pueden adoptarlos sin renombrar.

## Alcance comprobable

| Historia | Comportamiento en la vista de prueba |
| --- | --- |
| M-01 | Alta, búsqueda y corrección de vehículos. El dominio se normaliza (mayúsculas, sin espacios ni guiones), se valida (AAA123 o AA123AA) y es único. Corregir el dominio no rompe referencias (todo apunta al id interno) y queda auditado con el valor anterior. |
| M-02 | Estado activo / taller / baja con historial. Cambiar de estado cierra el período anterior; la baja no borra el vehículo y exige cerrar antes sus asignaciones vigentes. |
| M-03 | Una póliza cubre varios vehículos. Agregar o retirar un vehículo conserva su período en `poliza_vehiculo`. Renovar crea la póliza nueva con los vehículos cubiertos y cierra su cobertura en la anterior. |
| M-06 | Asignación de conductor con controles en vivo: persona de alta, vehículo no dado de baja, licencia vigente, categoría requerida por el vehículo, autorización en "sí" y sin superposición del mismo par. Un vehículo admite varios conductores y viceversa. |
| M-07 | Cierre manual de una asignación puntual con fecha y motivo; no toca ninguna otra. Las asignaciones vigentes con problemas sobrevinientes (licencia vencida, autorización no aprobada, persona de baja) se marcan en rojo, sin cerrarse solas. |
| M-08 | Revisión de autorizaciones cargadas por Legales: sí / no / pendiente con observación (obligatoria al rechazar). Registra quién y cuándo revisó. |
| M-09 | Ficha del vehículo con selector de fecha: estado, conductores, póliza, VTV y centro de costo vigentes ese día. |
| Consulta | VTV y centro de costo se muestran en solo lectura: la carga de VTV es M-04 y el centro de costo, FI-01. |

## Ejecutar y revisar

```bash
cd frontend
npm ci
npm run dev
node --test src/modulos/mantenimiento/dominio.test.js
```

En **Ver como**, elegir **Ana Gómez (Mantenimiento)** o **Admin Sistemas** y abrir Mantenimiento.

Para probar:
- Ficha de AA001ZZ y fecha de hace más de un año: otra póliza, otro centro de costo y sin conductores.
- Asignar Benítez a AA003ZZ: falla la categoría (la Daily pide C.1).
- Asignar Estévez a cualquier vehículo: falla la autorización hasta aprobarla en la pestaña Autorizaciones; después se habilita.
- Asignación de Costa en AA002ZZ: marcada en rojo (licencia vencida y autorización pendiente).
- Dar de baja AA001ZZ sin cerrar sus asignaciones: lo impide.
- Nuevo vehículo con dominio `ab-777 zz`: se guarda como `AB777ZZ`; repetirlo da error.
- Renovar POL-DEMO-0002 y volver a la ficha con una fecha anterior.

## Límites y próxima integración

- Interfaz de demostración, no módulo productivo. Datos ficticios y en memoria: al recargar o salir se reinician.
- Personas, licencias y autorizaciones copian los ids y legajos de la demo de RRHH para que ambos módulos cuenten la misma historia. **Propuesta:** mover los datos de prueba compartidos (personas, vehículos, asignaciones) a `core/` y que cada módulo los importe; hoy los vehículos de la demo de RRHH (`DEMO-01`, `DEMO-02`) no coinciden con los de Mantenimiento.
- Las fechas `hoy`, `vigenteEn` y `diasHasta` están duplicadas en RRHH y Mantenimiento con el mismo criterio. **Propuesta:** llevarlas a `core/` en un PR acordado.
- Períodos `[vigente_desde, vigente_hasta)` como en RRHH. En `poliza` y `vtv`, `vigente_hasta` es el vencimiento del documento y se toma como último día cubierto.
- La auditoría en memoria es solo apoyo de la demo; la real (`auditoria_evento`, en la misma transacción) la escribe el backend.
- La regla de no superposición de asignaciones se valida en la aplicación, como indica el esquema v1.0 (sin restricción de rango en la base).
- En modo real no se muestra la demo; se indica que falta la API. Reemplazar `servicioDemo.js` por un servicio que llame a la API, manteniendo las reglas también en el backend.
