import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SesionProvider } from './core/sesion/SesionContext'
import { TemaProvider } from './core/tema/TemaContext'
import { MODULOS } from './core/config/modulos'
import Layout from './core/layout/Layout'
import RutaModulo from './core/layout/RutaModulo'
import Inicio from './paginas/Inicio'
import NoEncontrada from './paginas/NoEncontrada'

// Ficha completa de un vehículo (búsqueda por dominio de la pantalla principal).
const FichaVehiculo = lazy(() => import('./paginas/FichaVehiculo'))

export default function App() {
  return (
    <TemaProvider>
      <SesionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Inicio />} />
              <Route path="vehiculo/:dominio" element={<FichaVehiculo />} />
              {MODULOS.map((m) => (
                <Route key={m.id} path={`${m.ruta}/*`} element={<RutaModulo modulo={m} />} />
              ))}
              <Route path="*" element={<NoEncontrada />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SesionProvider>
    </TemaProvider>
  )
}
