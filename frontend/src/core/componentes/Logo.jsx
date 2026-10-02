import logo from '../../assets/logo-aubasa.png'

// Logo oficial de AUBASA (versión color). En modo oscuro se muestra en blanco
// con un filtro CSS (.logo en estilos.css), como permite el manual de marca.
export default function Logo() {
  return <img src={logo} alt="AUBASA" className="logo" />
}
