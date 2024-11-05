import React, { useState } from 'react';
import { Modal, notification } from 'antd';
import '../../adminUsuarios/ui/admin-usuarios.css'
import { IPuestoTrabajo } from '../../shared/models/AdminModels';

export const ModalRegisterArea: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [nombreArea, setNombreArea] = useState('');
  const [nombrePuesto, setNombrePuesto] = useState('');
  const [rol, setRol] = useState<"Jefe" | "Empleado" | "Admin" | ''>('');
  const [puestos, setPuestos] = useState<IPuestoTrabajo[]>([]);

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

    // Aquí puedes agregar la lógica para guardar el área y los puestos en Firebase
    // Ejemplo: await registerAreaWithPuestos(nombreArea, puestos);

    notification.success({
      message: 'Éxito',
      description: 'Área y puestos registrados correctamente.',
    });

    // Limpiar los campos y cerrar el modal
    setNombreArea('');
    setPuestos([]);
    onClose();
  };

  return (
    <Modal title="Registrar área" open={isOpen} onCancel={onClose} footer={null}>
      <div className="div-register-form">
        <label>Nombre área</label>
        <input
          type="text"
          value={nombreArea}
          onChange={(e) => setNombreArea(e.target.value)}
          placeholder="Nombre del área"
        />
      </div>

      <h5>Agregar puesto</h5>
      <div className="div-register-form">
        <label>Nombre de puesto</label>
        <input
          type="text"
          value={nombrePuesto}
          onChange={(e) => setNombrePuesto(e.target.value)}
          placeholder="Nombre del puesto"
        />
      </div>

      <div className="div-register-form">
        <label>Rol</label>
        <select value={rol} onChange={(e) => setRol(e.target.value as "Jefe" | "Empleado" | "Admin")}>
          <option value="">Selecciona un rol</option>
          <option value="Jefe">Jefe</option>
          <option value="Empleado">Empleado</option>
          <option value="Admin">Admin</option>
        </select>
        <button onClick={handleAddPuesto} className="btn btn-blue">Agregar</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Puesto de trabajo</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto, index) => (
            <tr key={index}>
              <td>{puesto.nombre}</td>
              <td>{puesto.rol}</td>
              <td>
                <button onClick={() => handleRemovePuesto(index)} className="btn btn-desactivated">X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <button onClick={handleRegisterArea} className="btn btn-blue">Registrar área</button>
      </div>
    </Modal>
  );
};
