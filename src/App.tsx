import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './auth/ui/login/Login';
import { Home } from './home/ui/main/home';
import { checkActiveSession } from './auth/services/auth.services';

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const user = await checkActiveSession();
      if (user) {
        navigate('/home'); // Redirigir a Home si hay sesión activa
      } else {
        navigate('/'); // Redirigir a Login si no hay sesión activa
      }
    };

    verifySession();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home/>} />
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
