import { useState, useEffect } from 'react';
import './admin-usuarios.css';
import EditIcon from '../../../public/editIcon.svg';
import { getUsersInfo, getAreasInfo } from '../services/user.services';
import { Spin } from 'antd';
import { IUser } from '../../shared/models/IUsuario';
import { IAreaTrabajo } from '../../shared/models/AdminModels';

export const AdminUsuarios = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [areas, setAreas] = useState<IAreaTrabajo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estado para la modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getInfo = async () => {
      const usersData = await getUsersInfo();
      const areasData = await getAreasInfo();
      setUsers(usersData);
      setFilteredUsers(usersData);
      setAreas(areasData);
      setLoading(false);
    };
    getInfo();
  }, []);

  const handleAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(event.target.value);
    filterUsers(event.target.value, searchText);
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    filterUsers(selectedArea, event.target.value);
    setCurrentPage(1);
  };

  const filterUsers = (area: string, text: string) => {
    const filtered = users.filter(user => {
      const matchesArea = area ? user.areaTrabajo === area : true;
      const matchesText = text ? user.nombre.toLowerCase().includes(text.toLowerCase()) : true;
      return matchesArea && matchesText;
    });
    setFilteredUsers(filtered);
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Función para abrir/cerrar la modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <main className='container-render-area'>
      <section className='title-container'>
        <p>Usuarios</p>
      </section>
      
      {loading ? (
        <Spin
          tip="Cargando..."
          size="large"
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      ) : (
        <section className='cards-container'>
          <div className='div-filters'>
            <div className='filter-container'>
              <select 
                className='select-input' 
                value={selectedArea} 
                onChange={handleAreaChange}
              >
                <option value="">Todas las áreas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.nombre}>{area.nombre}</option>
                ))}
              </select>
            </div>
            <div className='filter-container'>
              <input 
                className='select-input' 
                type="text" 
                placeholder="Buscar por nombre"
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className='container-fluid users-cards-section'>
            <div className='row'>
              {currentUsers.map((user) => (
                <div key={user.uid} className='col-12 col-xl-3 col-md-6 col-sm-12'>
                  <div className='card-user'>
                    <div className='title-cards'>
                      <span>{user.nombre}</span>
                    </div>
                    <div className='info-card-container'>
                      <div className='div-icon-edit'>
                        <img src={EditIcon} alt="Edit icon" />
                      </div>
                      <div className='mb-2'>
                        <span>Correo:</span><br/>
                        <span>{user.correoElectronico}</span>
                      </div>
                      <div className='mb-2'>
                        <span>Area:</span><br/>
                        <span>{user.areaTrabajo}</span>
                      </div>
                      <div className='mb-2'>
                        <span>Puesto:</span><br/>
                        <span>{user.puestoTrabajo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paginación */}
          <div className='pagination'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`page-button ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Botón FAB */}
      <button className="fab-button" onClick={toggleModal}>
        +
      </button>

      {/* Modal de Pantalla Completa */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={toggleModal}>
              X
            </button>
            {/* Contenido de la modal */}
            <h2>Contenido de la Modal</h2>
            <p>Esta es una modal de pantalla completa.</p>
          </div>
        </div>
      )}
    </main>
  );
};
