import { useState, useEffect } from "react";
import { IUser } from "../../../shared/models/IUsuario";
import { Drawer, Button, Spin } from "antd";
import { getInfoUser, logout } from "../../../auth/services/auth.services";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./home.css";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userRol, setRol] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getInfoUser();
      if (user) {
        setUserData(user);
        setRol(user.puestoTrabajoDetalle?.rol ?? '');
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const logOut = async () =>{
  try {
    await logout();
    navigate('/');
  } catch (error) {
    console.log(error);
  }

  }

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  return (
    <>
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
        <>
          <main className="d-flex">
            <section className="sideBar">
              <div className="info-sideBar">
                <img src="./logoIW.png" alt="logoIW" />
                <p>{userData ? userData.nombre : "Nombre Usuario"}</p>{" "}
              </div>
              <div className="opt-section">
                <div className="opt-container">
                <p className="option">Gestion de áreas</p>
                <p className="option">Asignaciones</p>
                <p className="option">Usuarios</p>
             
                </div>
                <div className="btn-logout-container">
                    <p onClick={logOut} className="option">Cerrar sesión</p>
                </div>
              </div>
            </section>
            <section className="renderSection">
              <Button
                type="primary"
                icon={<MenuOutlined />}
                onClick={showDrawer}
                className="mobile-menu-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-menu-2"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="#ffffff"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 6l16 0" />
                  <path d="M4 12l16 0" />
                  <path d="M4 18l16 0" />
                </svg>
              </Button>
            </section>
          </main>

          <Drawer
            className="drawerBar"
            placement="left"
            onClose={closeDrawer}
            open={visible}
            headerStyle={{ display: "none" }}
            closable={true}
          >
            <div className="sidebar-content">
              <div className="info-sideBar">
                <section className="section-btn-drawer">
                <button
                  onClick={closeDrawer}
                  className="btn btn-close-offcanvas"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-x"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="#ffffff"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
                </section>
                <section className="section-logo-drawer">
                  <img src="./logoIW.png" alt="logoIW" />
                  <p>{userData ? userData.nombre : "Nombre Usuario"}</p>{" "}
                </section> 
              </div>
              <div className="opt-section">
                <div className="opt-container">
                <p className="option">Gestion de áreas</p>
                <p className="option">Asignaciones</p>
                <p className="option">Usuarios</p>
             
                </div>
                <div className="btn-logout-container">
                    <p onClick={logOut} className="option">Cerrar sesión</p>
                </div>
              </div>
            </div>
          </Drawer>
        </>
      )}
    </>
  );
};
