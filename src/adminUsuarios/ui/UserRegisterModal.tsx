/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from 'react';
import { Popconfirm } from 'antd';
import { getAreasInfo, getCargosInfo } from '../services/user.services';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (user: { nombre: string; correo: string; contrasena: string; area: string; cargo: string }) => void;
  onUpdate: (user: any) => void;
  selectedUser: any | null;
}

export const UserRegisterModal: React.FC<UserRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  onUpdate,
  selectedUser,
}) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [area, setArea] = useState('');
  const [cargo, setCargo] = useState('');
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [cargos, setCargos] = useState<{ id: string; nombre: string; idAreaTrabajo: string }[]>([]);
  const [filteredCargos, setFilteredCargos] = useState(cargos);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const areasData = await getAreasInfo();
      const cargosData = await getCargosInfo();
      setAreas(areasData);
      setCargos(cargosData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setNombre(selectedUser.nombre);
      setCorreo(selectedUser.correoElectronico);
      setArea(selectedUser.areaId);
      setCargo(selectedUser.puestoId);
      setContrasena('');
    } else {
      handleClear();
    }
  }, [selectedUser]);

  useEffect(() => {
    setFilteredCargos(cargos.filter((c) => c.idAreaTrabajo === area));
  }, [area, cargos]);

  const handleRegister = () => {
    const userData = { nombre, correo, contrasena, area, cargo };
    selectedUser ? onUpdate(userData) : onRegister(userData);
    handleClear();
    onClose();
  };

  const handleClear = () => {
    setNombre('');
    setCorreo('');
    setContrasena('');
    setArea('');
    setCargo('');
  };

  const isFormComplete = nombre && /\S+@\S+\.\S+/.test(correo) && (selectedUser || contrasena) && area && cargo;
  const hasData = nombre || correo || contrasena || area || cargo;

  // Cerrar modal con animación de salida
  const handleModalClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      handleClear();
      onClose();
    }, 400); // Tiempo coincide con la duración de la animación
  };

  if (!isOpen && !closing) return null;

  return (
    <div className={`modal-overlay ${closing ? 'hide' : ''}`}>
      <div className={`modal-content ${closing ? 'hide' : ''}`}>
        {hasData ? (
          <Popconfirm
            title="Al cerrar la model se perdaran los datos, desea cerrar?"
            onConfirm={handleModalClose}
            onCancel={() => {}}
            okText="Sí"
            cancelText="No"
          >
            <button className="close-button">X</button>
          </Popconfirm>
        ) : (
          <button className="close-button" onClick={handleModalClose}>X</button>
        )}
        <h4 className="text-center fw-bold mb-5">{selectedUser ? 'Editar Usuario' : 'Registrar Usuario'}</h4>
        <div className="div-register-form">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="div-register-form">
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </div>
        {!selectedUser && (
          <div className="div-register-form">
            <label>Contraseña</label>
            <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </div>
        )}
        <div className="div-register-form">
          <label>Área de trabajo</label>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">Seleccione un área</option>
            {areas.map((areaOption) => (
              <option key={areaOption.id} value={areaOption.id}>
                {areaOption.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="div-register-form">
          <label>Cargo</label>
          <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
            <option value="">Seleccione un cargo</option>
            {filteredCargos.map((cargoOption) => (
              <option key={cargoOption.id} value={cargoOption.id}>
                {cargoOption.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex justify-content-center">
          <button
            className={`btn ${isFormComplete ? 'btn-blue' : 'btn-desactivated'}`}
            onClick={handleRegister}
            disabled={!isFormComplete}
          >
            {selectedUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
