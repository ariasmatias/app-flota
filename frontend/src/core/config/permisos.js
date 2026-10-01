import { TODAS } from './areas'

// ¿El usuario puede ver este módulo en el menú y entrar a su ruta?
// Solo afecta la interfaz. El backend vuelve a validar cada pedido.
export function puedeVer(usuario, modulo) {
  if (!usuario) return false
  if (usuario.area === 'SISTEMAS') return true
  if (modulo.areas === TODAS) return true
  return modulo.areas.includes(usuario.area)
}

export function modulosVisibles(usuario, modulos) {
  return modulos.filter((m) => puedeVer(usuario, m))
}
