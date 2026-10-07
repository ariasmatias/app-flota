# Ficha de vehículo, conductores con varios vehículos y estado de gestión de multas

Cambios pedidos por Jorge el 07/10/2026 después de revisar la demo. Todo sigue con datos ficticios del seed compartido y en memoria.

## Pantalla principal: búsqueda por dominio (core)

- El buscador de arriba ahora busca **módulos y dominios** (también marca o modelo). Acepta el dominio con espacios o guiones (`aa 001-zz`).
- Cada resultado abre `/vehiculo/<DOMINIO>`: **ficha completa de solo lectura** con lo de hoy (conductores, póliza, VTV, centro de costo, tarjeta YPF, tag) y todo el historial: conductores, estados, pólizas, VTV, centro de costo, multas, tarjeta YPF, tag y documentos.
- La ven **todas las áreas**, porque es una consulta. Los cambios se siguen haciendo en cada módulo.
- Archivos: `core/datos/seed.js` (lector del seed, movido desde RRHH), `core/datos/fichaVehiculo.js` (búsqueda y armado de la ficha, con pruebas), `core/datos/flotaDePrueba.js`, `paginas/FichaVehiculo.jsx`, ruta en `App.jsx`, buscador en `paginas/Inicio.jsx`.
- Con la API, `fichaCompleta` se reemplaza por `GET /api/vehiculos/:dominio/ficha` con la misma forma de respuesta. El backend decide quién puede consultarla.
- Limitación de la demo: la ficha lee el seed, así que no muestra los cambios hechos en memoria dentro de un módulo.

## Mantenimiento: una persona con varios vehículos

- **Asignar conductor** permite elegir **varios vehículos de una vez** (Desplegable con `multiple`). Los controles se muestran una vez para la persona (alta, licencia, autorización) y por cada vehículo (no está de baja, categoría, no repetido). Se guarda **todo o nada**: si uno falla, no se guarda ninguno y se dice cuál (`asignarVarios`).
- Nueva pestaña **Conductores**: lista de personas con los vehículos que manejan hoy. La ficha de la persona muestra los vehículos actuales y los anteriores, y deja asignar más.
- El control "Sin otra asignación del mismo par en ese período" se reescribió, porque **sí funciona**: evita cargar dos veces a la misma persona en el mismo vehículo. Ahora dice "No tiene ya este vehículo asignado en esas fechas" o "Ya tiene este vehículo asignado desde el …".
- La ficha del vehículo en Mantenimiento enlaza a la ficha completa.

## RRHH: estado de gestión de cada informe de multa

- Al subir un aviso o informe en una multa, es **obligatorio** indicar el **estado de gestión** que responde ese informe. Valores **provisorios, a confirmar con RRHH**: Primer aviso, Segundo aviso, Aviso final, Descargo del conductor, Descuento aplicado, Gestión cerrada.
- Cada informe guarda fecha, responsable en ese momento y quién lo cargó. La bandeja de multas muestra la última gestión.
- La ficha de la persona en RRHH tiene **Avisos por multas**: cuántos avisos recibió (los estados que dicen "aviso") y todos los informes cargados.
- **Falta en la base:** el esquema v1.0 no tiene dónde guardar esto. Propuesta: tabla `multa_gestion` (id, multa_id, estado, documento_id, responsable_id, fecha, cargado_por). Queda anotado en las dudas para Mariano.

## Desplegable (core)

- Nueva opción `multiple`: lista con casillas, queda abierta para seguir marcando y muestra las elegidas (o "N elegidos").
