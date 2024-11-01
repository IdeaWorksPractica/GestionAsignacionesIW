import { useState, useEffect } from 'react';
import './admin-usuarios.css';
import EditIcon from '../../../public/editIcon.svg';
import { getUsersInfo } from '../services/user.services';
import { Spin } from 'antd';
import { IUser } from '../../shared/models/IUsuario';
import { UserRegisterModal } from './UserRegisterModal';

export const AdminUsuarios = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  useEffect(() => {
    const getInfo = async () => {
      const usersData = await getUsersInfo();
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    };
    getInfo();
  }, []);

  const handleRegister = (newUser: { nombre: string; correo: string; contrasena: string; area: string; cargo: string }) => {
    console.log('Nuevo usuario registrado:', newUser);
  };

  const handleUpdateUser = (updatedUser: IUser) => {
    console.log('Usuario actualizado:', updatedUser);
  };

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

  const toggleModal = (user?: IUser) => {
    setSelectedUser(user || null);
    setIsModalOpen(!isModalOpen);
  };

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
                {Array.from(new Set(users.map(user => user.areaTrabajo))).map((area, index) => (
                  <option key={index} value={area}>{area}</option>
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
                <div key={user.uid} className='col-12 col-xl-3 col-lg-3 col-md-6 col-sm-12' onClick={() => toggleModal(user)}>
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

      <button className="fab-button" onClick={() => toggleModal()}>
      <span className="fab-content">+</span>
      </button>

      <UserRegisterModal
        isOpen={isModalOpen}
        onClose={() => toggleModal()}
        onRegister={handleRegister}
        onUpdate={handleUpdateUser}
        selectedUser={selectedUser}
      />
    </main>
  );
};
