import React, { useState } from "react";
import "./login.css";
import { login, forgotPassword } from "../../services/auth.services";
import { Spin, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Crear el ícono blanco para usar en el spinner
const antIcon = <LoadingOutlined style={{ fontSize: 24, color: "white" }} spin />;

// Expresión regular para validar correos electrónicos
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Tipos permitidos para las notificaciones
type NotificationType = 'success' | 'info' | 'warning' | 'error';

// Función para mostrar notificaciones
const showNotification = ({
  message,
  description,
  type = 'error', // Valor por defecto 'error'
  placement = 'topRight',
}: {
  message: string;
  description: string;
  type?: NotificationType; // Restringir el tipo a valores válidos
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) => {
  notification[type]({
    message,
    description,
    placement,
  });
};

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setPassword(e.target.value);
  };

  // Mostrar alerta si los campos están vacíos
  const handleForgotPassword = async () => {
    if (!email) {
      showNotification({
        message: "Correo requerido",
        description: "Por favor, ingresa tu correo electrónico para restablecer tu contraseña.",
        type: "error",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      showNotification({
        message: "Correo Electrónico Inválido",
        description: "Por favor, ingresa un correo electrónico válido.",
        type: "error",
      });
      return;
    }

    try {
      await forgotPassword(email);
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showNotification({
        message: "Campos Vacíos",
        description: "Los campos de correo electrónico y contraseña no deben estar vacíos.",
        type: "error",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      showNotification({
        message: "Correo Electrónico Inválido",
        description: "Por favor, ingresa un correo electrónico válido.",
        type: "error",
      });
      return;
    }

    setLoading(true); // Activar el spinner mientras se espera la respuesta

    try {
      const response = await login(email, password);
      console.log("Respuesta de login:", response);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setLoading(false); // Desactivar el spinner después de obtener la respuesta
    }
  };

  return (
    <main className="main-container-login">
      <section className="form-login">
        <img className="logo-loginForm" src="./logoIW.png" alt="IW-logo" />
        <p className="mb-5">INGRESAR</p>

        <div className="input-container">
          <label>Correo electrónico</label>
          <input
            type="text"
            value={email}
            onChange={handleEmailChange} // Maneja el cambio del input
          />
        </div>

        <div className="input-container">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange} // Maneja el cambio del input
          />
          <span className="password-forget" onClick={handleForgotPassword}>
            Olvidaste tu contraseña?
          </span>
        </div>

        <div className="mt-4">
          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spin indicator={antIcon} /> : "Iniciar sesión"} {/* Mostrar el spinner blanco */}
          </button>
        </div>
      </section>
    </main>
  );
};
