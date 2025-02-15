import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Login } from "./auth/ui/login/Login";
import { Home } from "./home/ui/main/home";
import { getInfoUser, checkActiveSession } from "./auth/services/auth.services";
import { AdminUsuarios } from "./adminUsuarios/ui/AdminUsuarios";
import { Areas } from "./areas/ui/Areas";
import { MostrarAsignacion } from "./asignaciones/ui/Mostrar-asignacion/MostrarAsignacion";
import { Asignaciones } from "./asignaciones/ui/Asignaciones";
import  Calendar  from "./calendar/ui/Calendar";
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      const user = await checkActiveSession();
      if (user) {
        let allowedPaths: string[] = [];
        const dataUser = await getInfoUser();
  
        if (dataUser?.puestoTrabajoDetalle?.rol === "Empleado") {
          allowedPaths = [
            "/home/asignaciones",
            "/home/asignacion", // Base path for dynamic routes
            "/home/calendar",
          ];
        } else {
          allowedPaths = [
            "/home/asignaciones",
            "/home/admin-usuarios",
            "/home/admin-areas",
            "/home/calendar",
          ];
        }
  
        const isAllowed =
          allowedPaths.some((path) => location.pathname.startsWith(path)) ||
          allowedPaths.includes(location.pathname);
  
        if (!isAllowed) {
          navigate("/home/asignaciones");
        }
      } else {
        navigate("/");
      }
    };
  
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />}>
        <Route path="asignaciones" element={<Asignaciones />} />
        <Route path="asignacion/:id" element={<MostrarAsignacion />} />
        <Route path="admin-usuarios" element={<AdminUsuarios />} />
        <Route path="admin-areas" element={<Areas />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>
    </Routes>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
