# App Flota

Aplicación web interna para centralizar la gestión de flota, usuarios, documentación, talleres y procesos asociados.

## Estado

En etapa de diseño y desarrollo. La infraestructura productiva está pendiente de entrega. Este repositorio contiene la estructura y documentación inicial; todavía no incluye una aplicación ejecutable.

## Tecnologías y arquitectura prevista

- JavaScript como lenguaje principal.
- React para el frontend.
- Backend / API: framework pendiente de definición; preferencia por JavaScript.
- PostgreSQL como base de datos propia.
- Integración futura con SQL Server corporativo.
- Autenticación corporativa vinculada a Active Directory, según lo que habilite Infraestructura.
- Almacenamiento de archivos fuera del repositorio.

El frontend se comunica con la API. El backend concentra lógica de negocio, validaciones, permisos, auditoría y acceso a datos. Las conexiones corporativas se implementan mediante adaptadores desacoplados.

## Primera etapa

- Diseñar interfaz principal, menú y navegación.
- Definir módulos funcionales y permisos.
- Diagramar y versionar el modelo de datos.
- Desarrollar frontend, backend y API.
- Implementar gestión de archivos y auditoría.
- Utilizar exclusivamente datos ficticios de prueba.

Active Directory, SSO/Kerberos, SQL Server real, DNS, certificados, red y despliegue productivo quedan pendientes de las condiciones de Infraestructura. Docker es opcional y se evaluará después; no es requisito para empezar.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `frontend/src/` | Interfaz React |
| `backend/src/` | API y lógica propia |
| `integrations/` | Adaptadores de servicios externos, consumidos por el backend |
| `database/migrations/` | Cambios versionados de PostgreSQL |
| `database/seed/` | Datos ficticios |
| `docs/` | Arquitectura, módulos, modelo y decisiones |

## Cómo comenzar

1. Clonar el repositorio: `git clone https://github.com/ariasmatias/app-flota.git`.
2. Leer [los módulos](docs/modulos.md) y [las decisiones técnicas](docs/decisiones-tecnicas.md).
3. Crear una rama desde `develop` para cada tarea.
4. Definir herramientas, versiones y scripts de ejecución antes de incorporar dependencias.

Todavía no hay `package.json`, dependencias ni comandos de ejecución. Se agregarán junto con la primera implementación. Las versiones se acordarán en equipo y los archivos de bloqueo de dependencias se versionarán.

## Configuración

`.env.example` documenta variables propuestas con valores locales o vacíos. No existe todavía un cargador de configuración. Al implementarlo, cada desarrollador usará archivos `.env` ignorados por Git.

Las credenciales y variables de base de datos son exclusivas del backend. Nunca se enviarán al navegador ni se incluirán en variables públicas del frontend.

## Trabajo con Git

- `main`: base estable.
- `develop`: desarrollo integrado.
- `feature/<tarea>`: cambios por funcionalidad.

Flujo: `feature/* → develop → main`, mediante pull requests y revisión del equipo. Ejemplos: `feature/menu-principal`, `feature/vehiculos`, `feature/modelo-datos`. Estas son convenciones; no implican protecciones automáticas configuradas en GitHub.

## Contenido del repositorio público

Publicar únicamente código, documentación genérica y datos ficticios. No subir contraseñas, tokens, archivos `.env`, claves privadas, datos productivos, archivos de usuarios ni detalles sensibles de la red corporativa. El `.gitignore` ayuda a evitar incorporaciones accidentales; revisar el contenido antes de cada commit.

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [Módulos](docs/modulos.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)
- [Infraestructura pendiente](docs/infraestructura-pendiente.md)

No se incorpora una licencia open source en esta etapa.
