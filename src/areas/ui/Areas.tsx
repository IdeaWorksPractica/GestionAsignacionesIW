import { useState, useEffect } from "react";
import '../../shared/styles/admin-usuarios.css'
import { Spin, List } from "antd";
import { getAreasInfo, getCargosInfo } from "../../shared/services/areas_puestos.services";
import { IAreaTrabajo, IPuestoTrabajo } from "../../shared/models/AdminModels";
import { ModalRegisterArea } from './ModalRegisterArea';
import { Pagination } from "../../shared/ui/Pagination";
import { getScreenWidthMinusOffset } from "../../shared/services/title.service";

export const Areas = () => {
  const [titleWidth, setWidth] = useState<number>();
  const [areas, setAreas] = useState<IAreaTrabajo[]>([]);
  const [cargos, setCargos] = useState<IPuestoTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 580 ? 2 : 6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<IAreaTrabajo | null>(null);
  const [selectedCargos, setSelectedCargos] = useState<IPuestoTrabajo[]>([]);

  // Función para obtener datos de áreas y cargos
  const getInfo = async () => {
    setWidth(getScreenWidthMinusOffset());
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

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(
        window.innerWidth <= 580 ? 2 : window.innerWidth <= 991 ? 4 : 6
      );
    };
    ;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrar cargos por área
  const getCargosByArea = (areaId: string) => {
    return cargos.filter(cargo => cargo.idAreaTrabajo === areaId);
  };

  // Obtener áreas de la página actual
  const indexOfLastArea = currentPage * itemsPerPage;
  const indexOfFirstArea = indexOfLastArea - itemsPerPage;
  const currentAreas = areas.slice(indexOfFirstArea, indexOfLastArea);

  // Función para abrir y cerrar el modal y setear el área seleccionada
  const toggleModal = (area?: IAreaTrabajo) => {
    if (area) {
      setSelectedArea(area);
      setSelectedCargos(getCargosByArea(area.id));
    } else {
      setSelectedArea(null);
      setSelectedCargos([]);
    }
    setIsModalOpen(!isModalOpen);
  };

  return (
    <main className='container-render-area'>
      <section className='title-container' style={{width:`${titleWidth}px`}}>
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
          <div className='container-fluid h-100'>
            <div className='row h-100'>
              {currentAreas.map((area) => (
                <div
                  key={area.id}
                  className='col-12 col-xl-3 col-lg-4 col-md-6 col-sm-12 cards-heigth'
                  onClick={() => toggleModal(area)}
                >
                  <div className='card-user'>
                    <div className='title-cards'>
                      <span>{area.nombre}</span>
                    </div>
                    <div className='info-card-container h-100'>
                      <span className="mb-2 fw-bold">Cargos:</span>
                      <div className="div-list-container">
                      <List
                        dataSource={getCargosByArea(area.id)}
                        renderItem={(cargo) => (
                          <List.Item>
                            <span>{cargo.nombre}</span>
                          </List.Item>
                        )}
                        size="small"
                      />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            totalItems={areas.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
          />
        </section>
      )}

      <button className="fab-button" onClick={() => toggleModal()}>
        <span className="fab-content">+</span>
      </button>

      <ModalRegisterArea
        isOpen={isModalOpen}
        onClose={() => toggleModal()}
        selectedArea={selectedArea}
        initialCargos={selectedCargos}
        refreshData={getInfo}
      />
    </main>
  );
};
