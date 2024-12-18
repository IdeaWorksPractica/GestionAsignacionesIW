import {
  useState,
  useEffect,
  useRef,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import './mostrarAsignacion.css'
import { useParams } from "react-router-dom";
import { obtenerAsignacionSeleccionada } from "../../services/asignacion.seleccionada.service";
import {
  getComentariosAgrupadosPorFecha,
  createComentario,
} from "../../services/comentarios.services";
import { Spin, Popconfirm, message } from "antd";
import { getInfoUser } from "../../../auth/services/auth.services";

interface Comentario {
  id: string;
  contenido: string;
  uid_usuario: string;
  hora: string;
}

interface GrupoComentarios {
  fecha: string;
  comentarios: Comentario[];
}

interface Asignacion {
  id_asignacion_usuario: string;
  nombre_asignacion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  descripcion_asignacion: string;
  creadoPor: {
    nombre_usuario: string;
    cargo: string;
  };
  usuario_asignado: {
    nombre_usuario: string;
    puesto: string;
  };
}

interface Usuario {
  uid: string;
  puestoTrabajoDetalle: {
    nombre: string;
  };
}

export const MostrarAsignacion = () => {
  const comentariosEndRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<GrupoComentarios[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [userLogged, setLogged] = useState<Usuario | null>(null);

  const scrollToBottom = () => {
    comentariosEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getData = async () => {
    setLoading(true);
    try {
      const user = await getInfoUser();
      const asignacionDetalle = await obtenerAsignacionSeleccionada(id);
      await getComments();
      setAsignacion(asignacionDetalle);
      setLogged(user);
    } catch (error) {
      console.error("Error al obtener la asignación:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComments = async () => {
    const comentarios = await getComentariosAgrupadosPorFecha(id!);
    setComentarios(comentarios);
    scrollToBottom();
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [comentarios]);

  const handleConfirmChange = () => {
    if (pendingChange) {
      setAsignacion((prev) => (prev ? { ...prev, estado: pendingChange } : null));
      setPendingChange(null);
    }
  };

  const handleCancelChange = () => setPendingChange(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      messageApi.error("El comentario no puede estar vacío");
      return;
    }

    try {
      const nuevoComentario = {
        id_asignacionXusuario: asignacion?.id_asignacion_usuario!,
        uid_usuario: userLogged?.uid!,
        contenido: newComment,
      };

      const comentarioCreado = await createComentario(nuevoComentario);

      setComentarios((prevComentarios) => {
        const fechaHoy = new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const horaActual = new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const nuevoComentarioSimplificado: Comentario = {
          id: comentarioCreado.id,
          contenido: newComment,
          uid_usuario: userLogged!.uid,
          hora: horaActual,
        };

        const grupoExistente = prevComentarios.find(
          (grupo) => grupo.fecha === fechaHoy
        );

        if (grupoExistente) {
          grupoExistente.comentarios.push(nuevoComentarioSimplificado);
          grupoExistente.comentarios.sort((a, b) =>
            a.hora.localeCompare(b.hora)
          );
          return [...prevComentarios];
        } else {
          return [
            ...prevComentarios,
            { fecha: fechaHoy, comentarios: [nuevoComentarioSimplificado] },
          ];
        }
      });

      setNewComment("");
      messageApi.success("Comentario registrado con éxito");
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      messageApi.error("Hubo un error, por favor intenta de nuevo");
    }
  };

  return (
    <section className="container-asignacion-seleccionada">
      {/* Contenedor principal de la asignación */}
      <section className="contenedor-global-1">
        <section className="title-content">
          <h4>Asignación: {asignacion?.nombre_asignacion}</h4>
        </section>
        <section className="section-info">
          <div className="firts-container">
            <div className="w-50">
              <span className="fecha-inicio">
                Fecha de Inicio: {asignacion?.fechaInicio}
              </span>
              <br />
              <span className="fecha-finalizacion">
                Fecha de Finalización: {asignacion?.fechaFin}
              </span>
            </div>
            <div className="w-50">
              <span>Estado: </span>
              <Popconfirm
                title="¿Estás seguro de que deseas cambiar el estado?"
                onConfirm={handleConfirmChange}
                onCancel={handleCancelChange}
                okText="Sí"
                cancelText="No"
                visible={pendingChange !== null} // Mostrar solo si hay un cambio pendiente
              >
                <select
                  className="select-list-estado"
                  value={asignacion?.estado} // Vincula el valor con asignacion.estado
                  onChange={(e) => setPendingChange(e.target.value)} // Manejar cambio pendiente
                >
                  <option value="sin-iniciar">Sin iniciar</option>
                  <option value="en-proceso">En Proceso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </Popconfirm>
            </div>
          </div>
          <div className="second-container">
            <div className="div-description">
              <span className="mb-2">Descripción del Proyecto:</span>
              <br />
              <p>{asignacion?.descripcion_asignacion}</p>
            </div>
            <div className="div-container-persona">
              <span>Personas:</span>
              <div className="container-persona">
                <div className="circle-img"></div>
                <div className="d-flex flex-column">
                  <span className="fw-bold">
                    {asignacion?.creadoPor.nombre_usuario}
                  </span>
                  <span>{asignacion?.creadoPor.cargo}</span>
                </div>
              </div>
              <div className="container-persona">
                <div className="circle-img"></div>
                <div className="d-flex flex-column">
                  <span className="fw-bold">
                    {asignacion?.usuario_asignado.nombre_usuario}
                  </span>
                  <span>{asignacion?.usuario_asignado.puesto}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
  
      {/* Título de la sección de comentarios */}
      <div className="titulo-comentarios">
        <p>Comentarios</p>
      </div>
  
      {/* Contenedor de comentarios con scroll limitado */}
      <section className="section-comentarios">
        <div className="comment-container">
          {comentarios.map((grupo) => (
            <div key={grupo.fecha}>
              {/* Encabezado con la fecha */}
              <h5 className="text-center">{grupo.fecha}</h5>
  
              {/* Comentarios del grupo */}
              {grupo.comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className={`conmment-boss ${
                    comentario.uid_usuario === userLogged?.uid ? "employed" : ""
                  }`}
                >
                  <div>
                    <div className="container-persona mb-1">
                      <div className="circle-img"></div>
                      <div className="d-flex flex-column">
                        <span className="fw-bold">
                          {comentario.uid_usuario === userLogged?.uid
                            ? "Tú"
                            : ""}
                        </span>
                        <span>{userLogged?.puestoTrabajoDetalle.nombre}</span>
                      </div>
                    </div>
                  </div>
                  <div className="container-comment-created">
                    <span className="text-end mb-1"></span>
                    <span className="mb-1">{comentario.contenido}</span>
                    <div className="d-flex justify-content-end">
                      <span>{grupo.fecha}</span>
                      <span className="px-3">{comentario.hora}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={comentariosEndRef}></div>
        </div>
      </section>
  
      {/* Input fijo para agregar un comentario */}
      <div className="input-conment">
        <input
          name="newComment"
          value={newComment}
          onChange={handleInputChange}
        />
        <button onClick={handleSubmit} className="btn p-0">
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
            <path d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34"></path>
            <path d="M16 19h6"></path>
            <path d="M19 16v6"></path>
          </svg>
        </button>
      </div>
      {contextHolder}
    </section>
  );
  
  
};
