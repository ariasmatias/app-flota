# Vehículos: M-01 ampliado (campos, baja, gerencia y jefaturas)

Sigue el documento de Mariano **"Flota: campos para el diseño de pantallas"** (v1.0, 08/10/2026) y las respuestas del mismo día. Se hizo sobre la pantalla de Mantenimiento que ya estaba (PR #4, #13, #14).

## Qué cambia

| Tema | Cómo queda |
| --- | --- |
| Campos nuevos | Año (obligatorio, 1900–2100), número de chasis y de motor (texto, hasta 30), clase de flota (Operativa / Ejecutiva, obligatoria). |
| Chasis | No se repite entre vehículos que siguen en la flota: "El chasis ya está en el vehículo AA001ZZ". Entre vehículos de baja se permite (pasa en la planilla real por un error de carga). |
| Dominio | Acepta AAA123, AA123AA y motos (123AAA, A123AAA). Si ya existe, el mensaje dice de qué vehículo es. |
| Fecha de alta | Obligatoria. Por defecto hoy; se puede poner una fecha pasada. |
| Baja | **Ya no es un estado.** El botón "Dar de baja" pide fecha y motivo (Venta, Siniestro, Fin de vida útil, Otro con nota obligatoria) y antes de confirmar lista lo que se va a cerrar: conductores, centro de costo, jefaturas, póliza, tarjeta de combustible, tag y estado. Se cierra todo junto o nada. El vehículo queda en solo lectura con el cartel "De baja desde…". Multas y VTV no se cierran. |
| Estado | Solo activo y taller. |
| Centro de costo y gerencia | Al elegir el centro de costo se propone su gerencia; se puede cambiar porque **puede no coincidir** (no es error, se muestra un aviso). Con historial. Esta carga puede pasar después al módulo de Finanzas. |
| Jefaturas | Un vehículo puede tener **varias**, con historial. La lista se filtra por la gerencia elegida. |
| Conductores | Sin cambios: muchos a muchos. No hay casilla de "uso compartido": los vehículos de "Choferes" van a tener conductores con nombre. |
| Listado | Columnas: dominio, vehículo, año, clase, gerencia, jefatura, conductor, estado, alta, baja y vencimientos. Filtros: Vigentes (por defecto) / De baja / Todos, estado, clase, gerencia, jefatura y centro de costo. |
| Buscador | Por dominio (sin importar mayúsculas, espacios ni guiones), chasis, motor, marca o modelo. También en la búsqueda de la pantalla principal. |
| Ficha | Encabezado con año, alta y baja; chasis y motor; historial de estado, centro de costo y gerencia, jefaturas y conductores. La ficha completa del inicio suma lo mismo. |

## Datos provisorios

El esquema v1.0 y el seed todavía no tienen estas columnas. Hasta la migración 002, `frontend/src/core/datos/vehiculoProvisorio.js` completa los vehículos del seed con valores **ficticios**, con los nombres de columna previstos (ver `docs/modelo-datos.md`). Lo usan Mantenimiento y la ficha completa. Cuando exista la migración, se borra ese archivo.

Casos de prueba que arma:

| Caso | Dato |
| --- | --- |
| Ejecutivos | AA014ZZ, AA018ZZ, AA019ZZ |
| Gerencia distinta a la del centro de costo | AA014ZZ (Gerencia General con un centro de Administración) |
| Varias jefaturas | AA003ZZ |
| Sin jefatura | AA020ZZ |
| De baja con motivo | AA005ZZ (Fin de vida útil), AA019ZZ (Otro, con nota) |
| Chasis repetido entre dos vehículos de baja | AA005ZZ y AA019ZZ |

## Probar

```bash
cd frontend
node --test src/modulos/mantenimiento/dominio.test.js src/core/datos/fichaVehiculo.test.js
npm run dev
```

- Nuevo vehículo con el chasis `DEMOCHASIS0000001`: error, ya está en AA001ZZ.
- Nuevo vehículo eligiendo un centro de costo: se completa la gerencia. Cambiar la gerencia: aparece el aviso, pero deja guardar.
- Ficha de AA001ZZ → Dar de baja: lista 8 cosas a cerrar; al confirmar queda en solo lectura y sale de "Vigentes".
- Filtro "De baja": AA005ZZ y AA019ZZ.
- Buscar `demo-mot-0012`: aparece AA012ZZ.
