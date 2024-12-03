import { useState, useEffect } from "react"
import './mostrarAsignacion.css'
import { useParams } from "react-router-dom"
import { IAsignacionSeleccionada } from "../../../shared/models/IAsignaciones"
import { obtenerAsignacionSeleccionada } from "../../services/asignacion.seleccionada.service"
export const MostrarAsignacion = () => {
  const { id } = useParams();
  const [asignacion,setAsignacion] = useState<IAsignacionSeleccionada>()

  const getData = async () =>{
    const asignacionDetalle = await obtenerAsignacionSeleccionada(id)
    setAsignacion(asignacionDetalle)
    console.log('Detalle de la asignacion: ', asignacionDetalle)
  }
  useEffect(()=>{
    getData();
  },[])
  return (
    <section className="container-asignacion-seleccionada">
        <h3>{asignacion?.nombre_asignacion}</h3>
    </section>
  )
}
