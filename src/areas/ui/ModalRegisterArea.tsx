import React, { useState, useEffect } from 'react';
import { Modal, notification, Popconfirm, Spin } from 'antd';
import '../../adminUsuarios/ui/admin-usuarios.css';
import { IPuestoTrabajo, IAreaTrabajo } from '../../shared/models/AdminModels';
import { registerArea, registerCargos, deleteCargos } from '../../shared/services/areas_puestos.services';
import trash from '../../../public/icons/trash.svg';

interface ModalRegisterAreaProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArea?: IAreaTrabajo | null;
  refreshData: () => void;
  initialCargos?: IPuestoTrabajo[];
}

export const ModalRegisterArea: React.FC<ModalRegisterAreaProps> = ({
  isOpen,
  onClose,
  selectedArea,
  refreshData,
  initialCargos = []
}) => {
  const [nombreArea, setNombreArea] = useState('');
  const [nombrePuesto, setNombrePuesto] = useState('');
  const [rol, setRol] = useState<"Jefe" | "Empleado" | "Admin" | ''>('');
  const [puestos, setPuestos] = useState<IPuestoTrabajo[]>([]);
  const [puestosARegistrar, setPuestosARegistrar] = useState<IPuestoTrabajo[]>([]);
  const [puestosAEliminar, setPuestosAEliminar] = useState<IPuestoTrabajo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedArea) {
      setNombreArea(selectedArea.nombre);
      setPuestos(initialCargos);
    } else {
      setNombreArea('');
      setPuestos([]);
    }
  }, [selectedArea, initialCargos]);

  useEffect(() => {
    if (!isOpen) {
      setNombreArea('');
      setPuestos([]);
      setPuestosARegistrar([]);
      setPuestosAEliminar([]);
    }
  }, [isOpen]);

  const handleAddPuesto = () => {
    if (!nombrePuesto || !rol) {
      notification.error({
        message: 'Error',
        description: 'Debe ingresar el nombre del puesto y seleccionar un rol.',
      });
      return;
    }

    const newPuesto = { id: '', nombre: nombrePuesto, idAreaTrabajo: '', rol };
    setPuestos([...puestos, newPuesto]);
    setPuestosARegistrar([...puestosARegistrar, newPuesto]);

    setNombrePuesto('');
    setRol('');
  };

  const handleRemovePuesto = (index: number) => {
    const puestoToRemove = puestos[index];
    setPuestos(puestos.filter((_, i) => i !== index));

    if (puestoToRemove.id) {
      setPuestosAEliminar([...puestosAEliminar, puestoToRemove]);
    } else {
      setPuestosARegistrar(puestosARegistrar.filter(p => p !== puestoToRemove));
    }
  };

  const showConfirmation = () => {
    Modal.confirm({
      title: selectedArea ? 'Actualizar Area' : 'Registrar Area',
      content: (
        <div className="custom-confirm-content">
          {`¿Estás seguro de que deseas ${selectedArea ? 'actualizar' : 'registrar'} esta area?`}
        </div>
      ),
      className: 'custom-confirm-modal',
      okText: 'Sí',
      cancelText: 'No',
      onOk: handleRegisterOrUpdateArea,
    });
  };

  const handleRegisterOrUpdateArea = async () => {
    if (!nombreArea || puestos.length === 0) {
      notification.error({
        message: 'Error',
        description: 'Debe ingresar el nombre del área y al menos un puesto de trabajo.',
      });
      return;
    }

    setLoading(true); // Inicia el spinner de carga

    try {
      if (selectedArea) {
        await registerCargos(selectedArea.id, puestosARegistrar);
        
        if (puestosAEliminar.length > 0) {
          await deleteCargos(puestosAEliminar);
        }

        notification.success({
          message: 'Éxito',
          description: 'Área y puestos actualizados correctamente.',
        });
      } else {
        const idArea = await registerArea(nombreArea);
        if (idArea === null) {
          notification.error({
            message: 'Error',
            description: 'Hubo un error al registrar el área, intentelo más tarde.',
          });
          return;
        }
        await registerCargos(idArea, puestos);

        notification.success({
          message: 'Éxito',
          description: 'Área y puestos registrados correctamente.',
        });
      }

      setNombreArea('');
      setPuestos([]);
      setPuestosARegistrar([]);
      setPuestosAEliminar([]);
      refreshData();
      onClose();
    } catch (error) {
      console.error("Error en registro o actualización:", error);
      notification.error({
        message: 'Error',
        description: 'Ocurrió un problema al procesar la solicitud.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (nombreArea || puestos.length > 0) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirm(false);
    setTimeout(() => {
      setNombreArea('');
      setPuestos([]);
      setPuestosARegistrar([]);
      setPuestosAEliminar([]);
      onClose();
    }, 100);
  };

  return (
    <Modal
      maskClosable={false}
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
    >
      <h4 className="text-center fw-bold mb-3">
        {selectedArea ? 'Actualizar área' : 'Registrar área'}
      </h4>
      <div className="div-register-form">
        <label>Nombre área</label>
        <input
          type="text"
          value={nombreArea}
          onChange={(e) => setNombreArea(e.target.value)}
          placeholder="Nombre del área"
          disabled={!!selectedArea}
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto, index) => (
            <tr key={index}>
              <td>{puesto.nombre}</td>
              <td>{puesto.rol}</td>
              <td className='text-center'>
                <button onClick={() => handleRemovePuesto(index)} className="btn p-0">
                  <img className='img-fluid p-0' src={trash} alt="trash icon" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <button onClick={showConfirmation} className="btn btn-blue" disabled={loading}>
          {loading ? <Spin /> : selectedArea ? 'Actualizar área' : 'Registrar área'}
        </button>
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
