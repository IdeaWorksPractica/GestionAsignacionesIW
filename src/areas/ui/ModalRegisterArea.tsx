import React, { useState, useEffect } from 'react';
import { Modal, notification, Popconfirm } from 'antd';
import '../../adminUsuarios/ui/admin-usuarios.css';
import { IPuestoTrabajo, IAreaTrabajo } from '../../shared/models/AdminModels';
import { registerArea, registerCargos } from '../../shared/services/areas_puestos.services';

interface ModalRegisterAreaProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArea?: IAreaTrabajo | null;
  initialCargos?: IPuestoTrabajo[];
}

export const ModalRegisterArea: React.FC<ModalRegisterAreaProps> = ({
  isOpen,
  onClose,
  selectedArea,
  initialCargos = []
}) => {
  const [nombreArea, setNombreArea] = useState('');
  const [nombrePuesto, setNombrePuesto] = useState('');
  const [rol, setRol] = useState<"Jefe" | "Empleado" | "Admin" | ''>('');
  const [puestos, setPuestos] = useState<IPuestoTrabajo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Solo actualizar los estados si `isOpen` cambia a `true`
      setNombreArea(selectedArea?.nombre || '');
      setPuestos(initialCargos);
    }
  }, [isOpen, selectedArea, initialCargos]);

  const handleAddPuesto = () => {
    if (!nombrePuesto || !rol) {
      notification.error({
        message: 'Error',
        description: 'Debe ingresar el nombre del puesto y seleccionar un rol.',
      });
      return;
    }

    setPuestos([...puestos, { id: '', nombre: nombrePuesto, idAreaTrabajo: '', rol }]);
    setNombrePuesto('');
    setRol('');
  };

  const handleRemovePuesto = (index: number) => {
    const updatedPuestos = [...puestos];
    updatedPuestos.splice(index, 1);
    setPuestos(updatedPuestos);
  };

  const handleRegisterArea = async () => {
    if (!nombreArea || puestos.length === 0) {
      notification.error({
        message: 'Error',
        description: 'Debe ingresar el nombre del área y al menos un puesto de trabajo.',
      });
      return;
    }

    const idArea = await registerArea(nombreArea);
    if (idArea === null) {
      return;
    }
    await registerCargos(idArea, puestos);

    notification.success({
      message: 'Éxito',
      description: 'Área y puestos registrados correctamente.',
    });

    // Limpiar los campos y cerrar la modal
    setNombreArea('');
    setPuestos([]);
    onClose();
  };

  const handleModalClose = () => {
    if (nombreArea || puestos.length > 0) {
      setShowConfirm(true); // Activa el Popconfirm si hay datos sin guardar
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirm(false);
    setTimeout(() => {
      setNombreArea('');
      setPuestos([]);
      onClose();
    }, 100); // Puedes ajustar el tiempo de espera según la necesidad
  };

  return (
    <Modal
      maskClosable={false}
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
    >
      <h4 className="text-center fw-bold mb-3">Registrar área</h4>
      <div className="div-register-form">
        <label>Nombre área</label>
        <input
          type="text"
          value={nombreArea}
          onChange={(e) => setNombreArea(e.target.value)}
          placeholder="Nombre del área"
        />
      </div>

      <p className='subtitulo-modal'>Agregar puesto</p>
      <div className="div-register-form">
        <label>Nombre de puesto</label>
        <input
          type="text"
          value={nombrePuesto}
          onChange={(e) => setNombrePuesto(e.target.value)}
          placeholder="Nombre del puesto"
        />
      </div>

      <div className='div-agregar-opt'>
        <div className="div-register-form w-75 mb-0">
          <label>Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value as "Jefe" | "Empleado")}>
            <option value="">Selecciona un rol</option>
            <option value="Jefe">Jefe</option>
            <option value="Empleado">Empleado</option>
          </select>
        </div>
        <button onClick={handleAddPuesto} className="btn btn-blue w-25">Agregar</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Puesto de trabajo</th>
            <th>Rol</th>
            <th>Quitar</th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto, index) => (
            <tr key={index}>
              <td>{puesto.nombre}</td>
              <td>{puesto.rol}</td>
              <td className='text-center'>
                <button onClick={() => handleRemovePuesto(index)} className="btn btn-close"></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <button onClick={handleRegisterArea} className="btn btn-blue">Registrar área</button>
      </div>

      <Popconfirm
        title="¿Estás seguro de que deseas cerrar la modal? Los datos ingresados se perderán."
        visible={showConfirm}
        onConfirm={confirmClose}
        onCancel={() => setShowConfirm(false)}
        okText="Sí"
        cancelText="No"
      >
        <button
          className="close-button"
          onClick={() => {
            if (nombreArea || puestos.length > 0) {
              setShowConfirm(true);
            } else {
              onClose();
            }
          }}
          style={{ position: 'absolute', top: 15, right: 15 }}
        >
        </button>
      </Popconfirm>
    </Modal>
  );
};
