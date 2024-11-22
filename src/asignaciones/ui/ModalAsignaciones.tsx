import React, { useState, useEffect } from 'react';
import { Modal, notification, Spin } from 'antd';
import { IAsignacion } from '../../shared/models/IAsignaciones';
import { getUsersInfo } from '../../adminUsuarios/services/user.services';
import {
  crearAsignacion,
  actualizarAsignacion,
  obtenerAsignacionesPorUsuario,
} from '../services/asignaciones.service';
import { IUser } from '../../shared/models/IUsuario';

interface ModalRegisterAsignacionProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsignacion?: IAsignacion | null;
  refreshData: () => void;
  loggedUser: IUser | null;
}

export const ModalRegisterAsignacion: React.FC<ModalRegisterAsignacionProps> = ({
  isOpen,
  onClose,
  selectedAsignacion,
  refreshData,
  loggedUser,
}) => {
  const [nombreAsignacion, setNombreAsignacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<
    { uid: string; nombre: string; areaTrabajo: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAsignacion) {
      setNombreAsignacion(selectedAsignacion.nombre);
      setDescripcion(selectedAsignacion.descripcion);
      setFechaInicio(selectedAsignacion.fechaInicio.toISOString().split('T')[0]);
      setFechaFin(selectedAsignacion.fechaFin.toISOString().split('T')[0]);

      obtenerAsignacionesPorUsuario(selectedAsignacion.id)
        .then((asignaciones) => {
          setUsuarios(asignaciones.map((a) => a.uid));
        })
        .catch((error) => {
          console.error('Error al obtener usuarios:', error);
        });
    } else {
      resetForm();
    }
  }, [selectedAsignacion]);

  useEffect(() => {
    if (isOpen) {
      fetchUsuariosDisponibles();
    }
  }, [isOpen]);

  const resetForm = () => {
    setNombreAsignacion('');
    setDescripcion('');
    setFechaInicio('');
    setFechaFin('');
    setUsuarios([]);
    setUsuariosDisponibles([]);
  };

  const fetchUsuariosDisponibles = async () => {
    try {
      const allUsuarios = await getUsersInfo();
      const usuarioLogueado =allUsuarios.find(user => user.uid === loggedUser?.uid);

      console.log('User Logged:',loggedUser)
      console.log('Todos los usuarios:', allUsuarios);

      // Filtrar usuarios según las reglas
      const usuariosFiltrados = allUsuarios.filter((user) => {
        // Regla 1: Si el puesto del usuario logueado es "Project Manager", incluir usuarios del área "Creatividad".
        if (loggedUser?.puestoTrabajoDetalle?.nombre === 'Project Manager' && user.areaTrabajo === 'Creatividad') {
          return true;
        }

        // Regla 2: Incluir usuarios del área de trabajo del usuario logueado.
        return user.areaTrabajo === usuarioLogueado?.areaTrabajo;
      });

      console.log('Usuarios filtrados:', usuariosFiltrados);

      setUsuariosDisponibles(
        usuariosFiltrados.map((user) => ({
          uid: user.uid,
          nombre: user.nombre,
          areaTrabajo: user.areaTrabajo,
        }))
      );
    } catch (error) {
      console.error('Error al obtener usuarios disponibles:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudieron cargar los usuarios disponibles.',
      });
    }
  };

  const handleAddUsuario = (uid: string) => {
    if (usuarios.includes(uid)) {
      notification.error({
        message: 'Error',
        description: 'El usuario ya está en la lista.',
      });
      return;
    }
    setUsuarios([...usuarios, uid]);
  };

  const handleRemoveUsuario = (uid: string) => {
    setUsuarios(usuarios.filter((user) => user !== uid));
  };

  const handleRegisterOrUpdate = async () => {
    if (!nombreAsignacion || !descripcion || !fechaInicio || !fechaFin || usuarios.length === 0) {
      notification.error({
        message: 'Error',
        description: 'Debe completar todos los campos y agregar al menos un usuario.',
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedAsignacion) {
        // Actualizar asignación
        await actualizarAsignacion(selectedAsignacion.id, {
          nombre: nombreAsignacion,
          descripcion,
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
        });
        notification.success({
          message: 'Éxito',
          description: 'Asignación actualizada correctamente.',
        });
      } else {
        // Crear nueva asignación
        await crearAsignacion(
          {
            id: '',
            nombre: nombreAsignacion,
            descripcion,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            creadoPor: loggedUser.uid, // Utilizamos el UID del usuario logueado
          },
          usuarios
        );
        notification.success({
          message: 'Éxito',
          description: 'Asignación registrada correctamente.',
        });
      }

      resetForm();
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error al registrar o actualizar la asignación:', error);
      notification.error({
        message: 'Error',
        description: 'Ocurrió un problema al procesar la solicitud.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal maskClosable={false} open={isOpen} onCancel={onClose} footer={null}>
      <h4 className="text-center fw-bold mb-3">
        {selectedAsignacion ? 'Actualizar Asignación' : 'Registrar Asignación'}
      </h4>

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
        <label>Usuarios</label>
        <select
          onChange={(e) => handleAddUsuario(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Seleccionar usuario
          </option>
          {usuariosDisponibles.map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.nombre} - {user.areaTrabajo}
            </option>
          ))}
        </select>
      </div>

      <ul>
        {usuarios.map((uid) => (
          <li key={uid}>
            {uid}{' '}
            <button onClick={() => handleRemoveUsuario(uid)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-center mt-3">
        <button
          onClick={handleRegisterOrUpdate}
          className="btn btn-blue"
          disabled={loading}
        >
          {loading ? <Spin /> : selectedAsignacion ? 'Actualizar Asignación' : 'Registrar Asignación'}
        </button>
      </div>
    </Modal>
  );
};
