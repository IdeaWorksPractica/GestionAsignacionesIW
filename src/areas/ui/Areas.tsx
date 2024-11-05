import { useState, useEffect } from "react";
import '../../adminUsuarios/ui/admin-usuarios.css';
import { Spin, List } from "antd";
import { getAreasInfo, getCargosInfo } from "../../shared/services/areas_puestos.services";
import { IAreaTrabajo, IPuestoTrabajo } from "../../shared/models/AdminModels";
import { ModalRegisterArea } from './ModalRegisterArea'; // Importa el modal

export const Areas = () => {
  const [areas, setAreas] = useState<IAreaTrabajo[]>([]);
  const [cargos, setCargos] = useState<IPuestoTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 580 ? 2 : 6); // Ajuste dinámico de items por página
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal

  // Función para obtener datos de áreas y cargos
  const getInfo = async () => {
    setLoading(true);
    const areasData = await getAreasInfo();
    const cargosData = await getCargosInfo();
    setAreas(areasData);
    setCargos(cargosData);
    setLoading(false);
  };

  useEffect(() => {
    getInfo();
  }, []);

  // Actualizar items por página en función del tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 580 ? 2 : 6);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // Limpieza del listener
  }, []);

  // Filtrar cargos por área
  const getCargosByArea = (areaId: string) => {
    return cargos.filter(cargo => cargo.idAreaTrabajo === areaId);
  };

  // Configuración de paginación
  const indexOfLastArea = currentPage * itemsPerPage;
  const indexOfFirstArea = indexOfLastArea - itemsPerPage;
  const currentAreas = areas.slice(indexOfFirstArea, indexOfLastArea);
  const totalPages = Math.ceil(areas.length / itemsPerPage);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Función para abrir y cerrar el modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <main className='container-render-area'>
      <section className='title-container'>
        <p>Áreas y Cargos</p>
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
          <div className='container-fluid users-cards-section'>
            <div className='row'>
              {currentAreas.map((area) => (
                <div key={area.id} className='col-12 col-xl-3 col-lg-3 col-md-6 col-sm-12'>
                  <div className='card-user'>
                    <div className='title-cards'>
                      <span>{area.nombre}</span>
                    </div>
                    <div className='info-card-container'>
                      <span className="mb-2 fw-bold">Cargos:</span>
                      <List
                        dataSource={getCargosByArea(area.id)}
                        renderItem={(cargo) => (
                          <List.Item>
                            <span>{cargo.nombre}</span>
                          </List.Item>
                        )}
                        size="small"
                        bordered
                      />
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

      {/* Botón flotante para abrir el modal */}
      <button className="fab-button" onClick={toggleModal}>
        <span className="fab-content">+</span>
      </button>

      {/* Modal para registrar áreas y cargos */}
      <ModalRegisterArea
        isOpen={isModalOpen}
        onClose={toggleModal}
      />
    </main>
  );
};
