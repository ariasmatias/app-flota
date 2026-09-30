# Infraestructura pendiente

La aplicación se desarrolla localmente mientras se define y entrega el entorno productivo. Este documento registra requisitos por confirmar; no contiene configuraciones corporativas reales.

## Servidor

Confirmar sistema operativo, CPU, RAM, almacenamiento, acceso remoto, permisos para instalar servicios y restricciones de ejecución.

## Autenticación

Ideal: identidad de Active Directory con autenticación integrada o SSO. Kerberos es una posibilidad sujeta a las capacidades, políticas y colaboración de Infraestructura. El equipo se adaptará al mecanismo que se habilite. No se asume acceso administrativo al directorio.

Confirmar identificador estable de usuario, atributos disponibles y mecanismo permitido. La autorización funcional se mantiene en el backend.

## SQL Server

Confirmar tablas o vistas disponibles, campos, fuente de verdad, permisos de consulta, método de autenticación y conectividad. Los detalles sensibles se mantendrán fuera del repositorio público.

## Red y acceso

Confirmar DNS, certificados, puertos, firewall y acceso de usuarios. Prever operación interna sin dependencia de internet en tiempo de ejecución y un mecanismo aprobado para transferir código y dependencias al servidor.

## Archivos

Confirmar ruta o volumen autorizado, capacidad y permisos. El código debe aceptar rutas configurables.

## Despliegue

Acordar ejecución de servicios y posibilidad de usar contenedores. Las condiciones finales se validarán antes de habilitar producción.

Backups y actualizaciones quedan fuera del alcance de implementación del equipo de la aplicación, según lo acordado.
