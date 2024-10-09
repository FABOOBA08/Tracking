import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "bootstrap/dist/css/bootstrap.min.css";
import "boxicons/css/boxicons.min.css";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      const userData = {
        token: res.data.token,
        username: res.data.username,
        role: res.data.role,
      };
      // Guardar en el local storage
      localStorage.setItem("userData", JSON.stringify(userData));

      // Agregar el token JWT a los encabezados de autorización
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      navigate("/SolicitarSalidaCaja");
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response) {
        if (error.response.status === 404 || error.response.status === 401) {
          Swal.fire('Error', 'Datos Incorrectos', 'error');
        } else {
          Swal.fire('Error', 'Error del servidor. Por favor, inténtalo de nuevo más tarde.', 'error');
        }
      } else {
        Swal.fire('Error', 'Error del servidor. Por favor, inténtalo de nuevo más tarde.', 'error');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="row h-100 login-container">
        {/* Parte izquierda */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center p-0 login-image-container">
          <div
            className="bg-holder"
            style={{ backgroundImage: "url(/Meridiano.jpeg)" }}
          ></div>
        </div>
        {/* Final Parte Izquierda */}

        {/* Parte derecha */}
        <div className="col-lg-6 p-0 d-flex align-items-center justify-content-center">
          <div className="card transparencia p-4">
            <div className="text-center mb-4">
              <img src="/Logo.png" alt="Logo" className="login-logo" />
            </div>
            {/* Final Logotipo */}

            <div className="text-center mb-5">
              <h3 className="fw-bold">Inicio de sesión</h3>
              <p className="bienvenida">Bienvenido a tu sistema</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bx bx-user"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bx bx-lock-alt"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-lg fs-6"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 btoningreso"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
        {/* Final Parte Derecha */}
      </div>
    </div>
  );
};

export default Login;
