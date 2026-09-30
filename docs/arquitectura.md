# Arquitectura prevista

El desarrollo de la aplicación puede comenzar antes de recibir el servidor. El sistema operativo y el despliegue final están pendientes.

## Componentes

- Frontend React: navegación, formularios y presentación.
- Backend / API: reglas de negocio, validaciones, autorización, auditoría y gestión de archivos.
- PostgreSQL: datos propios de la aplicación.
- Integraciones: adaptadores para autenticación corporativa y lectura de datos externos.
- Archivos: almacenamiento configurable; PostgreSQL conserva metadatos y referencias.

El navegador no accede directamente a las bases de datos. Los permisos se verifican en el backend, además de adaptar la interfaz.

## Límites entre aplicación e infraestructura

Las integraciones exponen contratos estables a los servicios del backend. Durante desarrollo se usan implementaciones ficticias. Incorporar una conexión real puede requerir ajustes de identidad, campos, permisos y pruebas de integración; no se asume un reemplazo automático sin validación.

Active Directory identifica al usuario mediante el mecanismo autorizado por Infraestructura. Los roles y permisos funcionales pertenecen a la aplicación. La autenticación provisional será exclusiva de desarrollo y no habilitará acceso productivo.

SQL Server se utilizará inicialmente para consultas, con permisos mínimos. Las entidades corporativas se referenciarán mediante identificadores externos acordados. No se publican hosts, esquemas corporativos ni credenciales.

## Auditoría

Prever registro de actor, acción, entidad, identificador, fecha y resultado en operaciones relevantes. Definir qué cambios se conservan y cómo evitar registrar secretos o contenido sensible. Los eventos deben generarse en el backend y protegerse frente a modificaciones por usuarios comunes. El diseño detallado se acordará al definir cada módulo.

## Archivos

Prever autorización de carga y descarga, límites de tamaño, validación de tipo, nombres internos generados y rutas controladas. Los archivos no se almacenan en Git ni se sirven mediante rutas públicas sin control de acceso.

## Despliegue

Docker se evaluará cuando se conozcan las condiciones del servidor. La aplicación deberá poder configurarse por entorno. El despliegue interno no debe depender de servicios públicos, CDNs o conexiones corporativas disponibles para arrancar en desarrollo.
