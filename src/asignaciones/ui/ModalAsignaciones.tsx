import React, { useState, useEffect } from "react";
import { Modal, notification, Spin, Popconfirm } from "antd";
import trash from "../../../public/icons/trash.svg";
import { IAsignacion } from "../../shared/models/IAsignaciones";
import { getUsersInfo } from "../../adminUsuarios/services/user.services";
import {
  crearAsignacion,
  crearAsignacionXusuario,
  actualizarAsignacion,
  obtenerUsuariosPorAsignacion,
  eliminarAsignacionesPorUsuarios,
  eliminarAsignacion,
} from "../services/asignaciones.service";
import { IUser } from "../../shared/models/IUsuario";

interface ModalRegisterAsignacionProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsignacion?: IAsignacion | null;
  refreshData: () => void;
  loggedUser: IUser | null;
}

export const ModalRegisterAsignacion: React.FC<
  ModalRegisterAsignacionProps
> = ({ isOpen, onClose, selectedAsignacion, refreshData, loggedUser }) => {
  const [nombreAsignacion, setNombreAsignacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [newSeleccionados, setSeleccionado] = useState<string[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<
    { uid: string; nombre: string }[]
  >([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<
    { uid: string; nombre: string; areaTrabajo: string }[]
  >([]);
  const [usuariosParaEliminar, setUsuariosParaEliminar] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!isOpen) return;

      setLoadingUser(true);
      resetForm();

      try {
        await fetchUsuariosDisponibles();

        if (selectedAsignacion) {
          await cargarUsuariosAsignados();
          setNombreAsignacion(selectedAsignacion.nombre);
          setDescripcion(selectedAsignacion.descripcion);
          setFechaInicio(
            selectedAsignacion.fechaInicio.toISOString().split("T")[0]
          );
          setFechaFin(selectedAsignacion.fechaFin.toISOString().split("T")[0]);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        notification.error({
          message: "Error",
          description: "Ocurrió un problema al cargar los datos.",
        });
      } finally {
        setLoadingUser(false);
      }
    };

    cargarDatos();
  }, [isOpen, selectedAsignacion, loggedUser]);

  const resetForm = () => {
    setNombreAsignacion("");
    setDescripcion("");
    setFechaInicio("");
    setFechaFin("");
    setUsuariosSeleccionados([]);
    setUsuariosDisponibles([]);
    setUsuariosParaEliminar([]);
    setSeleccionado([]);
  };

  const fetchUsuariosDisponibles = async () => {
    try {
      const allUsuarios = await getUsersInfo();
  
      const usuarioLogueado = allUsuarios.find(
        (user) => user.uid === loggedUser?.uid
      );
  
      if (!usuarioLogueado) {
        throw new Error("Usuario logueado no encontrado.");
      }
  
      const usuariosFiltrados = allUsuarios.filter(
        (user) =>
          user.areaTrabajo === usuarioLogueado.areaTrabajo &&
          user.uid !== usuarioLogueado.uid // Excluir al usuario logueado
      );
  
      const usuariosFinales = selectedAsignacion
        ? usuariosFiltrados.filter(
            (user) => !usuariosSeleccionados.some((u) => u.uid === user.uid)
          )
        : usuariosFiltrados;
  
      setUsuariosDisponibles(
        usuariosFinales.map((user) => ({
          uid: user.uid,
          nombre: user.nombre,
          areaTrabajo: user.areaTrabajo,
        }))
      );
    } catch (error) {
      console.error("Error al obtener usuarios disponibles:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los usuarios disponibles.",
      });
    }
  };
  

  const cargarUsuariosAsignados = async () => {
    if (!selectedAsignacion) return;

    try {
      const usuariosAsignadosIds = await obtenerUsuariosPorAsignacion(
        selectedAsignacion.id
      );

      const allUsuarios = await getUsersInfo();

      const usuariosAsignados = usuariosAsignadosIds
        .map((uid) => {
          const usuarioInfo = allUsuarios.find((user) => user.uid === uid);
          if (usuarioInfo) {
            return { uid, nombre: usuarioInfo.nombre };
          }
          return null;
        })
        .filter((user) => user !== null) as { uid: string; nombre: string }[];

      setUsuariosSeleccionados(usuariosAsignados);
    } catch (error) {
      console.error("Error al cargar usuarios asignados:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los usuarios asignados.",
      });
    }
  };

  const handleAddUsuario = (uid: string) => {
    const usuario = usuariosDisponibles.find((u) => u.uid === uid);
    if (!usuario) return;

    if (usuariosSeleccionados.find((u) => u.uid === uid)) {
      notification.error({
        message: "Error",
        description: "El usuario ya está en la lista.",
      });
      return;
    }

    if (selectedAsignacion) {
      setSeleccionado([...newSeleccionados, uid]);
    }

    setUsuariosSeleccionados([
      ...usuariosSeleccionados,
      { uid, nombre: usuario.nombre },
    ]);
  };

  const handleRemoveUsuario = (uid: string) => {
    if (!usuariosParaEliminar.includes(uid)) {
      setUsuariosParaEliminar([...usuariosParaEliminar, uid]);
    }
    setUsuariosSeleccionados(
      usuariosSeleccionados.filter((u) => u.uid !== uid)
    );
  };

  const handleRegisterOrUpdate = async () => {
    if (
      !nombreAsignacion ||
      !descripcion ||
      !fechaInicio ||
      !fechaFin ||
      usuariosSeleccionados.length === 0
    ) {
      notification.error({
        message: "Error",
        description:
          "Debe completar todos los campos y agregar al menos un usuario.",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedAsignacion) {
        await actualizarAsignacion(selectedAsignacion.id, {
          nombre: nombreAsignacion,
          descripcion,
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
        });

        if (usuariosParaEliminar.length > 0) {
          await eliminarAsignacionesPorUsuarios(
            usuariosParaEliminar,
            selectedAsignacion.id
          );
        }

        if (newSeleccionados.length > 0) {
          await crearAsignacionXusuario(selectedAsignacion.id, newSeleccionados);
        }

        notification.success({
          message: "Éxito",
          description: "Asignación actualizada correctamente.",
        });
      } else {
        await crearAsignacion(
          {
            id: "",
            nombre: nombreAsignacion,
            descripcion,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            creadoPor: loggedUser?.uid || "",
          },
          usuariosSeleccionados.map((u) => u.uid)
        );
        notification.success({
          message: "Éxito",
          description: "Asignación registrada correctamente.",
        });
      }

      resetForm();
      refreshData();
      onClose();
    } catch (error) {
      console.error("Error al registrar o actualizar la asignación:", error);
      notification.error({
        message: "Error",
        description: "Ocurrió un problema al procesar la solicitud.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsignacion = async () => {
    if (!selectedAsignacion) return;

    setLoading(true);
    try {
      await eliminarAsignacion(selectedAsignacion.id);
      notification.success({
        message: "Éxito",
        description:
          "La asignación y sus datos relacionados se eliminaron correctamente.",
      });
      refreshData();
      onClose();
    } catch (error) {
      console.error("Error al eliminar la asignación:", error);
      notification.error({
        message: "Error",
        description: "No se pudo eliminar la asignación. Intente nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal maskClosable={false} open={isOpen} onCancel={onClose} footer={null}>
      <h4 className="text-center fw-bold mb-3">
        {selectedAsignacion ? "Actualizar Asignación" : "Registrar Asignación"}
      </h4>

      {loadingUser ? (
        <div className="text-center my-3">
          <Spin tip="Cargando usuarios asignados..." />
        </div>
      ) : (
        <>
          <div className="div-register-form">
            <label>Nombre</label>
            <input
              type="text"
              value={nombreAsignacion}
              onChange={(e) => setNombreAsignacion(e.target.value)}
              placeholder="Nombre de la asignación"
            />
          </div>
          <div className="div-register-form">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
            />
          </div>
          <div className="div-register-form">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="div-register-form">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="div-register-form">
            <label>Usuarios Disponibles</label>
            <select onChange={(e) => handleAddUsuario(e.target.value)} defaultValue="">
  <option value="" disabled>
    Seleccionar usuario
  </option>
  {usuariosDisponibles.length > 0 ? (
    usuariosDisponibles.map((user) => {
      console.log("Renderizando usuario:", user); // Depuración
      return (
        <option key={user.uid} value={user.uid}>
          {user.nombre} - {user.areaTrabajo}
        </option>
      );
    })
  ) : (
    <option value="" disabled>
      No hay usuarios disponibles
    </option>
  )}
</select>

          </div>

          <div className="div-register-form mt-4">
            <label>Usuarios Seleccionados</label>

            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuariosSeleccionados.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.nombre}</td>
                    <td className="d-flex justify-content-end">
                      <Popconfirm
                        title="¿Estás seguro de que deseas eliminar este usuario?"
                        onConfirm={() => handleRemoveUsuario(user.uid)}
                        okText="Sí"
                        cancelText="No"
                      >
                        <button className="btn p-0">
                          <img
                            className="img-fluid p-0"
                            src={trash}
                            alt="Eliminar usuario"
                          />
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <button
              onClick={handleRegisterOrUpdate}
              className="btn btn-blue"
              disabled={loading}
            >
              {loading ? (
                <Spin />
              ) : selectedAsignacion ? (
                "Actualizar Asignación"
              ) : (
                "Registrar Asignación"
              )}
            </button>
            {selectedAsignacion && !loading && (
              <Popconfirm
                title="¿Estás seguro de que deseas eliminar esta asignación?"
                onConfirm={handleDeleteAsignacion}
                okText="Sí"
                cancelText="No"
              >
                <button className="btn btn-danger mx-2">
                  Eliminar Asignación
                </button>
              </Popconfirm>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};
