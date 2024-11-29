import { useState, useEffect } from "react";
import { IUser } from "../../../shared/models/IUsuario";
import { Drawer, Button, Spin } from "antd";
import { getInfoUser, logout } from "../../../auth/services/auth.services";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate, Outlet, useLocation, To } from "react-router-dom";
import "./home.css";
export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userRol, setRol] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getInfoUser();
      if (user) {
        setUserData(user);
        console.log("Rol del usuario:", user.puestoTrabajoDetalle?.rol);
        setRol(user.puestoTrabajoDetalle?.rol ?? "");
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const logOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  const handleNavigation = (path: To) => {
    navigate(path);
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
                <img src="/logoIW.png" alt="logoIW" />
                <p>{userData ? userData.nombre : "Nombre Usuario"}</p>
              </div>
              <div className="opt-section">
                {(userRol === "Jefe" || userRol === "Admin") && (
                  <div className="opt-container">
                    <button
                      className={`option ${
                        location.pathname === "/home/admin-areas"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/admin-areas")}
                    >
                      Gestión de áreas
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/asignaciones"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/calendar"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/calendar")}
                    >
                      Calendario
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/admin-usuarios"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/admin-usuarios")}
                    >
                      Usuarios
                    </button>
                  </div>
                )}
                 {userRol === "Empleado" && (
                  <div className="opt-container">
                    <button
                      className={`option ${
                        location.pathname === "/home/calendar"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/calendar")}
                    >
                      Calendario
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/asignaciones"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>
                  </div>
                )}
                <div className="btn-logout-container">
                  <button onClick={logOut} className="option">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </section>
            <section className="renderSection">
              <div className="div-mobile-menu-button">
                <Button
                  type="primary"
                  icon={<MenuOutlined />}
                  onClick={showDrawer}
                  className="mobile-menu-button"
                ></Button>
              </div>
              <Outlet /> {/* Aquí se renderizan las rutas secundarias */}
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
                      strokeWidth="2.5"
                      stroke="#ffffff"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </section>
                <section className="section-logo-drawer">
                  <img src="/logoIW.png" alt="logoIW" />
                  <p>{userData ? userData.nombre : "Nombre Usuario"}</p>
                </section>
              </div>
              <div className="opt-section">
                {(userRol === "Jefe" || userRol === "Admin") && (
                  <div className="opt-container">
                    <button
                      className={`option ${
                        location.pathname === "/home/calendario"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/calendario")}
                    >
                      Calendario
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/admin-areas"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/admin-areas")}
                    >
                      Gestión de áreasssss
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/calendar"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>

                    <button
                      className={`option ${
                        location.pathname === "/home/asignaciones"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/admin-usuarios"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/admin-usuarios")}
                    >
                      Usuarios
                    </button>
                  </div>
                )}
                {userRol === "Empleado" && (
                  <div className="opt-container">
                    <button
                      className={`option ${
                        location.pathname === "/home/calendar"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>
                    <button
                      className={`option ${
                        location.pathname === "/home/asignaciones"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleNavigation("/home/asignaciones")}
                    >
                      Asignaciones
                    </button>
                  </div>
                )}
                <div className="btn-logout-container">
                  <button onClick={logOut} className="option">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </Drawer>
        </>
      )}
    </>
  );
};
