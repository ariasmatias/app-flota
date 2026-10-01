import { lazy } from 'react'
import { Truck, Users, Scale, Wallet, Route, CalendarClock, Bell, Settings } from 'lucide-react'
import { TODAS } from './areas'

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de módulos de la plataforma.
// Es el ÚNICO lugar donde se da de alta un módulo: de acá salen las tarjetas de
// la pantalla principal, las rutas y los permisos de navegación.
//
// Para sumar un módulo nuevo:
//   1. Crear la carpeta src/modulos/<id>/ con su index.jsx
//   2. Agregar una entrada en esta lista
//
// Campos:
//   id           identificador y carpeta del módulo
//   ruta         URL del módulo
//   nombre       título de la tarjeta
//   descripcion  texto corto de la tarjeta
//   etiqueta     texto chico arriba a la derecha de la tarjeta
//   categoria    'area' (módulo de una gerencia) o 'herramienta' (transversal)
//   areas        áreas que lo ven, o TODAS. Sistemas ve todo siempre.
//   icono        ícono de lucide-react
//   acento       color del módulo (paleta del manual de marca)
//   acentoClaro  versión clara del color, para modo oscuro (opcional)
//   responsable  quién lo desarrolla
//   historias    IDs de la guía de desarrollo
//   componente   pantalla del módulo (carga diferida)
//
// IMPORTANTE: esto solo decide qué se MUESTRA. El backend valida igual cada
// pedido (regla 3.5 de la guía): ocultar una tarjeta no es seguridad.
// ─────────────────────────────────────────────────────────────────────────────

export const MODULOS = [
  {
    id: 'mantenimiento',
    ruta: '/mantenimiento',
    nombre: 'Mantenimiento',
    descripcion: 'Vehículos, estados, pólizas, VTV y asignación de conductores.',
    etiqueta: 'Área',
    categoria: 'area',
    areas: ['MANTENIMIENTO'],
    icono: Truck,
    acento: '#00aec3',
    responsable: 'Jorge',
    historias: ['M-01', 'M-02', 'M-03', 'M-06', 'M-07', 'M-08', 'M-09'],
    componente: lazy(() => import('../../modulos/mantenimiento/index.jsx')),
  },
  {
    id: 'rrhh',
    ruta: '/rrhh',
    nombre: 'RRHH',
    descripcion: 'Fichas de persona, licencias de conducir y gestión de multas.',
    etiqueta: 'Área',
    categoria: 'area',
    areas: ['RRHH'],
    icono: Users,
    acento: '#e81f76',
    responsable: 'Matías',
    historias: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06'],
    componente: lazy(() => import('../../modulos/rrhh/index.jsx')),
  },
  {
    id: 'legales',
    ruta: '/legales',
    nombre: 'Legales',
    descripcion: 'Autorizaciones para conducir, multas y control de pólizas.',
    etiqueta: 'Área',
    categoria: 'area',
    areas: ['LEGALES'],
    icono: Scale,
    acento: '#592673',
    acentoClaro: '#a77fd0',
    responsable: 'Matías',
    historias: ['L-01', 'L-02', 'L-03', 'L-04', 'L-05'],
    componente: lazy(() => import('../../modulos/legales/index.jsx')),
  },
  {
    id: 'finanzas',
    ruta: '/finanzas',
    nombre: 'Finanzas',
    descripcion: 'Centros de costo, tarjetas YPF en Ruta y consumos mensuales.',
    etiqueta: 'Área',
    categoria: 'area',
    areas: ['FINANZAS'],
    icono: Wallet,
    acento: '#22a954',
    responsable: 'Matías y Jorge',
    historias: ['FI-01', 'FI-02', 'FI-05', 'FI-07', 'FI-11', 'FI-13', 'FI-16'],
    componente: lazy(() => import('../../modulos/finanzas/index.jsx')),
  },
  {
    id: 'comercial',
    ruta: '/comercial',
    nombre: 'Comercial',
    descripcion: 'Tags de telepeaje y autopistas habilitadas por vehículo.',
    etiqueta: 'Área',
    categoria: 'area',
    areas: ['COMERCIAL'],
    icono: Route,
    acento: '#417099',
    acentoClaro: '#7fa6cf',
    responsable: 'Jorge',
    historias: ['C-01', 'C-02'],
    componente: lazy(() => import('../../modulos/comercial/index.jsx')),
  },
  {
    id: 'vencimientos',
    ruta: '/vencimientos',
    nombre: 'Vencimientos',
    descripcion: 'Licencias, VTV y pólizas próximas a vencer, por fecha.',
    etiqueta: 'Herramienta',
    categoria: 'herramienta',
    areas: TODAS,
    icono: CalendarClock,
    acento: '#b7791f',
    acentoClaro: '#e0a64a',
    responsable: 'Matías',
    historias: ['N-08'],
    componente: lazy(() => import('../../modulos/vencimientos/index.jsx')),
  },
  {
    id: 'notificaciones',
    ruta: '/notificaciones',
    nombre: 'Bandeja',
    descripcion: 'Notificaciones y alarmas pendientes de tu área.',
    etiqueta: 'Herramienta',
    categoria: 'herramienta',
    areas: TODAS,
    icono: Bell,
    acento: '#00759a',
    acentoClaro: '#4fc3dc',
    responsable: 'Matías',
    historias: ['N-02'],
    componente: lazy(() => import('../../modulos/notificaciones/index.jsx')),
  },
  {
    id: 'sistemas',
    ruta: '/sistemas',
    nombre: 'Sistemas',
    descripcion: 'Usuarios, catálogos e historial de cambios.',
    etiqueta: 'Administración',
    categoria: 'herramienta',
    areas: ['SISTEMAS'],
    icono: Settings,
    acento: '#1f3464',
    acentoClaro: '#7f9be0',
    responsable: 'Matías',
    historias: ['I-05', 'A-03'],
    componente: lazy(() => import('../../modulos/sistemas/index.jsx')),
  },
]

// Secciones de la pantalla principal, en orden.
export const SECCIONES = [
  { id: 'area', nombre: 'Áreas' },
  { id: 'herramienta', nombre: 'Herramientas' },
]

export function buscarModulo(id) {
  return MODULOS.find((m) => m.id === id)
}
