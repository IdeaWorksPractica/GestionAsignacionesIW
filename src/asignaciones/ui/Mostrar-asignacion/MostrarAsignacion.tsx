import { useState, useEffect } from "react";
import "./mostrarAsignacion.css";
import { useParams } from "react-router-dom";
import { IAsignacionSeleccionada } from "../../../shared/models/IAsignaciones";
import { obtenerAsignacionSeleccionada } from "../../services/asignacion.seleccionada.service";
import { Spin } from "antd";

export const MostrarAsignacion = () => {
  const { id } = useParams();
  const [asignacion, setAsignacion] = useState<IAsignacionSeleccionada | null>(null);
  const [loading, setLoading] = useState(true); // Estado para controlar el spinner

  const getData = async () => {
    setLoading(true); // Muestra el spinner
    try {
      const asignacionDetalle = await obtenerAsignacionSeleccionada(id);
      setAsignacion(asignacionDetalle);
      console.log("Detalle de la asignacion: ", asignacionDetalle);
    } catch (error) {
      console.error("Error al obtener la asignación:", error);
    } finally {
      setLoading(false); // Oculta el spinner
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="Cargando asignación..." size="large" />
      </div>
    );
  }

  return (
    <section className="container-asignacion-seleccionada">
      <section>
        <h3 className="text-center mb-5">
          Asignación: {asignacion?.nombre_asignacion}
        </h3>
      </section>
      <section className="section-info">
        <div className="w-100 d-flex justify-start mb-4 p-0">
          <div className="w-50">
          <span>Fecha de Inicio: {asignacion?.fechaInicio}</span><br/>
          <span>Fecha de Finalización: {asignacion?.fechaFin}</span>
          </div>
          <div className="w-50">
            <span>Estado: </span>
            <select>
              <option value="">Sin iniciar</option>
              <option value="">En Proceso</option>
              <option value="">Finalizado</option>
            </select>
          </div>
        </div>
        <p>{asignacion?.descripcion_asignacion}</p>
      </section>
      <section className="section-comentarios">
        <div>

        </div>
        <div className="input-conment">
          <input name="" id=""></input>
          <button className="btn p-0">
          <svg xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24" fill="none" stroke="currentColor"  strokeLinecap="round" strokeLinejoin="round" width={30} height={30}  strokeWidth={2}> <path d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34"></path> <path d="M16 19h6"></path> <path d="M19 16v6"></path> </svg> 
        </button>
        </div>
        
      </section>
      
    </section>
  );
};
