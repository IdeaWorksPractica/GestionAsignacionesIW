import { useState, useEffect } from "react"
import './mostrarAsignacion.css'
import { useParams } from "react-router-dom"
import { IAsignacionSeleccionada } from "../../../shared/models/IAsignaciones"
import { obtenerAsignacionSeleccionada } from "../../services/asignacion.seleccionada.service"
export const MostrarAsignacion = () => {
  const { id } = useParams();
  const [asignacion,setAsignacion] = useState<IAsignacionSeleccionada>()
  useEffect(()=>{
    obtenerAsignacionSeleccionada('DpWc4V8MjS0RT1goDVPU')
  },[])
  return (
    <section className="container-asignacion-seleccionada">
        <h3></h3>
    </section>
  )
}
