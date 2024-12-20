
import React, { useState, useEffect } from 'react';
import { Modal, Spin, Popconfirm, notification } from 'antd';
import { registerUser, updateUserInfo } from '../services/user.services';
import { getAreasInfo, getCargosInfo } from '../../shared/services/areas_puestos.services';
import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { IAreaTrabajo, IPuestoTrabajo } from '../../shared/models/AdminModels';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshUsers: () => void;
  selectedUser: any | null;
}

export const UserRegisterModal: React.FC<UserRegisterModalProps> = ({
  isOpen,
  onClose,
  refreshUsers,
  selectedUser,
}) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [area, setArea] = useState('');
  const [cargo, setCargo] = useState('');
  const [areas, setAreas] = useState<IAreaTrabajo[]>([]);
  const [cargos, setCargos] = useState<IPuestoTrabajo[]>([]);
  const [filteredCargos, setFilteredCargos] = useState<IPuestoTrabajo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const antIcon = <LoadingOutlined style={{ fontSize: 24, color: "white" }} spin />;

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

  const handleRegisterOrUpdate = async () => {
    setLoading(true);
    try {
      if (selectedUser) {
        const hasChanges = 
          nombre !== selectedUser.nombre ||
          correo !== selectedUser.correoElectronico ||
          area !== selectedUser.areaId ||
          cargo !== selectedUser.puestoId;

        if (!hasChanges) {
          notification.info({
            message: 'Sin Cambios',
            description: 'Debe realizar al menos un cambio para actualizar la información.',
            placement: 'topRight',
          });
          setLoading(false);
          return;
        }

        await updateUserInfo(selectedUser.uid, { nombre, correoElectronico: correo, areaId: area, puestoId: cargo });
      } else {
        await registerUser(correo, contrasena, { nombre, areaId: area, puestoId: cargo });
      }

      handleClear();
      onClose();
      refreshUsers();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showConfirmation = () => {
    Modal.confirm({
      title: selectedUser ? 'Actualizar Usuario' : 'Registrar Usuario',
      content: (
        <div className="custom-confirm-content">
          {`¿Estás seguro de que deseas ${selectedUser ? 'actualizar' : 'registrar'} al usuario?`}
        </div>
      ),
      className: 'custom-confirm-modal',
      okText: 'Sí',
      cancelText: 'No',
      onOk: handleRegisterOrUpdate,
    });
  };

  const handleClear = () => {
    setNombre('');
    setCorreo('');
    setContrasena('');
    setArea('');
    setCargo('');
  };

  const isFormComplete = nombre && /\S+@\S+\.\S+/.test(correo) && (selectedUser || contrasena) && area && cargo;
  const hasData = Boolean(nombre || correo || contrasena || area || cargo);

  const handleModalClose = () => {
    if (hasData) {
      setShowConfirm(true); // Activa el Popconfirm si hay datos
    } else {
      handleClear();
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirm(false);
    setTimeout(() => {
        handleClear();
        onClose();
    }, 0);
};


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
      maskClosable={false}
    >
      <h4 className="text-center fw-bold mb-3">{selectedUser ? 'Editar Usuario' : 'Registrar Usuario'}</h4>
      <div className="div-register-form">
        <label>Nombre</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del usuario" />
      </div>

      <div className="div-register-form">
        <label>Correo electrónico</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Correo electrónico" />
      </div>

      {!selectedUser && (
        <div className="div-register-form">
          <label>Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="password-input-modal"
              placeholder="Contraseña"
            />
            <button type="button" onClick={togglePasswordVisibility} className="password-toggle-modal">
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>
      )}

      <div className='container-dos-componentes'>
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
      </div>

      <div className="d-flex justify-content-center mt-4">
        <button
          className={`btn ${isFormComplete ? 'btn-blue' : 'btn-desactivated'}`}
          onClick={showConfirmation}
          disabled={!isFormComplete}
        >
          {loading ? <Spin indicator={antIcon} /> : selectedUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
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
            if (hasData) {
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
