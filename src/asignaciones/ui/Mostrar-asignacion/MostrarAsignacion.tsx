import { useState, useEffect } from "react";
import "./mostrarAsignacion.css";
import { useParams } from "react-router-dom";
import { IAsignacionSeleccionada } from "../../../shared/models/IAsignaciones";
import { obtenerAsignacionSeleccionada } from "../../services/asignacion.seleccionada.service";
import { Spin, Divider, Select, Popconfirm } from "antd";

export const MostrarAsignacion = () => {
  const { id } = useParams();
  const [asignacion, setAsignacion] = useState<IAsignacionSeleccionada | null>(
    null
  );
  const [loading, setLoading] = useState(true); // Estado para controlar el spinner
  const [pendingChange, setPendingChange] = useState<string | null>(null); // Estado para manejar el cambio pendiente

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

  const { Option } = Select;

  const handleConfirmChange = () => {
    if (pendingChange) {
      setAsignacion((prev) => ({ ...prev, estado: pendingChange })); // Actualiza el estado
      console.log("Nuevo estado de la asignación:", pendingChange); // Imprime en consola
      setPendingChange(null); // Limpia el cambio pendiente
    }
  };

  const handleCancelChange = () => {
    console.log("Cambio cancelado");
    setPendingChange(null); // Limpia el cambio pendiente
  };

  return (
    <section className="container-asignacion-seleccionada">
      <section className="title-content">
        <h4>Asignación: {asignacion?.nombre_asignacion}</h4>
        <div>
          <span>Estado: </span>
          <Popconfirm
            title="¿Estás seguro de que deseas cambiar el estado?"
            onConfirm={handleConfirmChange}
            onCancel={handleCancelChange}
            okText="Sí"
            cancelText="No"
            visible={pendingChange !== null} // Mostrar solo si hay un cambio pendiente
          >
            <Select
              value={asignacion?.estado} // Vincula el valor con asignacion.estado
              style={{ width: 200 }}
              onChange={(value) => setPendingChange(value)} // Manejar cambio pendiente
            >
              <Option value="sin-iniciar">Sin iniciar</Option>
              <Option value="en-proceso">En Proceso</Option>
              <Option value="finalizado">Finalizado</Option>
            </Select>
          </Popconfirm>
        </div>
      </section>
      <section className="section-info">
        <div className="mb-3">
          <span>Fecha de Inicio: {asignacion?.fechaInicio}</span>
          <span className="px-5">
            Fecha de Finalización: {asignacion?.fechaFin}
          </span>
        </div>
        <Divider orientation="left" className="m-0 p-0">Descripción: </Divider>
        <br />
        <p>{asignacion?.descripcion_asignacion}</p>
      </section>
      <section className="section-comentarios">
        <div className="conment-container">
          <div className="conmment-boss">
            <span className="text-end mb-1">Harol Morales</span>
            <span className="mb-1">
              Este es uno de los primeros comentarios de prueba de la asignacion
            </span>
            <div className="d-flex justify-content-end">
              <span>20/11/24</span>
              <span className="px-3">16:40</span>
            </div>
          </div>
          <div className="conmment-boss employed">
            <span className="text-end mb-1">Harol Morales</span>
            <span className="mb-1">
              Este es uno de los primeros comentarios de prueba de la asignacion
            </span>
            <div className="d-flex justify-content-end">
              <span>20/11/24</span>
              <span className="px-3">16:40</span>
            </div>
          </div>
        </div>
        <div className="input-conment">
          <input name="" id=""></input>
          <button className="btn p-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              width={30}
              height={30}
              strokeWidth={2}
            >
              {" "}
              <path d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34"></path>{" "}
              <path d="M16 19h6"></path> <path d="M19 16v6"></path>{" "}
            </svg>
          </button>
        </div>
      </section>
    </section>
  );
};
