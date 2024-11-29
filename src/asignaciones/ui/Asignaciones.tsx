import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './asignaciones.css';
import '../../shared/styles/admin-usuarios.css';
import { getScreenWidthMinusOffset } from '../../shared/services/title.service';
import { Spin, DatePicker, notification } from 'antd';
import { Pagination } from '../../shared/ui/Pagination';
import { getInfoUser } from '../../auth/services/auth.services';
import { ModalRegisterAsignacion } from './ModalAsignaciones';
import {
  obtenerAsignacionesPorUsuario,
  getAsignacionesCreadasPorJefeConUsuarios,
} from '../services/asignaciones.service';
import { IAsignacion } from '../../shared/models/IAsignaciones';
import moment from 'moment';
import { IUser } from '../../shared/models/IUsuario';

export const Asignaciones = () => {
  const navigate = useNavigate();
  const [userLogged, setUserLogged] = useState<IUser | null>(null);
  const [titleWidth, setWidth] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [userRol, setRol] = useState<string>('');
  const [asignaciones, setAsignaciones] = useState<IAsignacion[]>([]);
  const [filteredAsignaciones, setFilteredAsignaciones] = useState<IAsignacion[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 580 ? 2 : 6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<IAsignacion | null>(null);

  const getInfo = async () => {
    setLoading(true);
    const user = await getInfoUser();
    setUserLogged(user);
    setRol(user?.puestoTrabajoDetalle?.rol ?? '');
    setWidth(getScreenWidthMinusOffset());

    // Obtener asignaciones según el rol
    if (user?.puestoTrabajoDetalle?.rol === 'Jefe') {
      const jefeAsignaciones = await getAsignacionesCreadasPorJefeConUsuarios(user.uid);
      setAsignaciones(jefeAsignaciones.map(({ asignacion }) => asignacion));
      setFilteredAsignaciones(jefeAsignaciones.map(({ asignacion }) => asignacion));
      console.log(jefeAsignaciones);
    } else {
      console.log('Se obtendran los datos de los demas usuarios')
      const usuarioAsignaciones = await obtenerAsignacionesPorUsuario(user.uid);
      console.log(user)
      console.log(usuarioAsignaciones);
      setAsignaciones(usuarioAsignaciones);
      setFilteredAsignaciones(usuarioAsignaciones);
    }

    setLoading(false);
  };

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 580 ? 2 : 6);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value.toLowerCase();
    setSearchText(text);
    filterAsignaciones(text, selectedDate);
    setCurrentPage(1);
  };

  const handleDateChange = (date: moment.Moment | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : null;
    setSelectedDate(formattedDate);
    filterAsignaciones(searchText, formattedDate);
    setCurrentPage(1);
  };

  const filterAsignaciones = (text: string, date: string | null) => {
    const filtered = asignaciones.filter((asignacion) => {
      const matchesText = text ? asignacion.nombre.toLowerCase().includes(text) : true;
      const matchesDate = date
        ? moment(asignacion.fechaInicio).format('YYYY-MM-DD') === date ||
          moment(asignacion.fechaFin).format('YYYY-MM-DD') === date
        : true;
      return matchesText && matchesDate;
    });
    setFilteredAsignaciones(filtered);
  };

  const handleCardClick = (asignacion: IAsignacion) => {
    if (userRol === 'Jefe') {
      setSelectedAsignacion(asignacion);
      setIsModalOpen(true);
    } else {
      notification.warning({
        message: 'Acceso Denegado',
        description: 'No tienes permisos para modificar asignaciones.',
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAsignacion(null);
  };

  const indexOfLastAsignacion = currentPage * itemsPerPage;
  const indexOfFirstAsignacion = indexOfLastAsignacion - itemsPerPage;
  const currentAsignaciones = filteredAsignaciones.slice(indexOfFirstAsignacion, indexOfLastAsignacion);

  return (
    <main>
      <section className="title-container" style={{ width: `${titleWidth}px` }}>
        <p>Asignaciones</p>
      </section>
      {loading ? (
        <Spin
          tip="Cargando..."
          size="large"
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      ) : (
        <section className="cards-container whit-filters">
          <div className="div-filters">
            <div className="filter-container">
              <input
                className="select-input"
                type="text"
                placeholder="Buscar por nombre"
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-container">
              <DatePicker
                className="select-input"
                onChange={handleDateChange}
                placeholder="Buscar por fecha"
                format="YYYY-MM-DD"
                allowClear
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '5px',
                  border: '1px solid #d9d9d9',
                  padding: '0 10px',
                }}
              />
            </div>
          </div>
          <div className="container-fluid users-cards-section">
            <div className="row h-100">
              {currentAsignaciones.length > 0 ? (
                currentAsignaciones.map((asignacion) => (
                  <div
                    key={asignacion.id}
                    className="col-12 col-xl-3 col-lg-4 col-md-6 col-sm-12 cards-heigth"
                    onClick={() => {
                      if (userRol === "Empleado") {
                        navigate(`/home/asignacion/${asignacion.idAsignacionesXUsuario}`);
                      } else {
                        handleCardClick(asignacion)
                      }
                    }}
                  >
                    <div className="card-user ">
                      <div className="title-cards">
                        <span>{asignacion.nombre}</span>
                      </div>
                      <div className="info-card-container pt-0">
                        <div className="mb-2">
                          <span className="fw-bold">Descripción:</span>
                          <br />
                          <span className='truncated-text'>{asignacion.descripcion}</span>
                        </div>
                        <div className="mb-2">
                          <span className="fw-bold">Fecha Inicio:</span>
                          <br />
                          <span>{moment(asignacion.fechaInicio).format('YYYY-MM-DD')}</span>
                        </div>
                        <div className="mb-2">
                          <span className="fw-bold">Fecha Fin:</span>
                          <br />
                          <span>{moment(asignacion.fechaFin).format('YYYY-MM-DD')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No hay asignaciones disponibles</p>
                </div>
              )}
            </div>
          </div>
          <Pagination
            totalItems={filteredAsignaciones.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
          />
        </section>
      )}
      {userRol === 'Jefe' && (
        <>
          <button className="fab-button" onClick={() => setIsModalOpen(true)}>
            <span className="fab-content">+</span>
          </button>
        </>
      )}
      <ModalRegisterAsignacion
        loggedUser={userLogged}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedAsignacion={selectedAsignacion}
        refreshData={() => {
          handleModalClose();
          getInfo();
        }}
      />
    </main>
  );
};
