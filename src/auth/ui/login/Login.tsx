import "./login.css";
export const Login = () => {
  return (
    <main className="main-container-login">
      <section className="form-login">
        <img className="logo-loginForm" src="./logoIW.png" alt="IW-logo" />
        <p className="mb-5">INGRESAR</p>
        <div className="input-container">
          <label>Correo electrónico</label>
          <input type="text" />
        </div>
        <div className="input-container">
          <label>Contraseña</label>
          <input type="password" />
          <span className="password-forget">Olvidaste tu contraseña?</span>
        </div>

        <div className="mt-4">
          <button className="btn-login">Iniciar sesión</button>
        </div>
      </section>
    </main>
  );
};
