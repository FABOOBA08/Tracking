import React, { useEffect, useState } from "react";
import "./SideBar.css";
import Swal from 'sweetalert2';


const Navbar = () => {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("")

  const Roles = {
    admin: "Administrador",
    tecnico: "Técnico",
    coordi: "Coordinador",
  };

  useEffect(() => {
    // Obtener el rol del usuario del localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setRole(parsedData.role);
      setUsername(parsedData.username)
    }

    const showNavbar = (toggleId, navId, bodyId, headerId) => {
      const toggle = document.getElementById(toggleId);
      const nav = document.getElementById(navId);
      const bodypd = document.getElementById(bodyId);
      const headerpd = document.getElementById(headerId);

      if (toggle && nav && bodypd && headerpd) {
        const toggleClickHandler = () => {
          nav.classList.toggle("show");
          toggle.classList.toggle("bx-x");
          bodypd.classList.toggle("body-pd");
          headerpd.classList.toggle("body-pd");
        };

        toggle.addEventListener("click", toggleClickHandler);

        return () => {
          toggle.removeEventListener("click", toggleClickHandler);
        };
      } else {
        return () => { }; // Devuelve una función vacía si no se encuentra alguno de los elementos
      }
    };

    const cleanup = showNavbar("header-toggle", "nav-bar", "body-pd", "header");

    return cleanup; // Devuelve la función de limpieza para eliminar eventos
  }, []);



  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
    });
  };


  const routes = {
    [Roles.admin]: [
      { path: "/UsuarioList", icon: "fa-users-gear", name: "Usuarios" },
      { path: "/CajasList", icon: "fa-box-archive", name: "Cajas" },
      { path: "/BodegaList", icon: "fa-warehouse", name: "Bodegas" },
      { path: "/PiezaList", icon: "fa-puzzle-piece", name: "Piezas" },
      { path: "/SolicitarSalidaCaja", icon: "fa-hand-point-up", name: "Solicitar Caja" },
      { path: "/SolicitudesList", icon: "fa-list-check", name: "Solicitudes" },
    ],
    [Roles.tecnico]: [
      { path: "/BodegaList", icon: "fa-warehouse", name: "Bodegas" },
      { path: "/PiezaList", icon: "fa-puzzle-piece", name: "Piezas" },
      { path: "/SolicitarSalidaCaja", icon: "fa-hand-point-up", name: "Solicitar Caja" },
    ],
    [Roles.coordi]: [
      { path: "/BodegaList", icon: "fa-warehouse", name: "Bodegas" },
      { path: "/PiezaList", icon: "fa-puzzle-piece", name: "Piezas" },
      { path: "/CajasList", icon: "fa-box-archive", name: "Cajas" },
      { path: "/SolicitudesList", icon: "fa-list-check", name: "Solicitudes" },
    ],
  };

  return (
    <div id="body-pd">
      <div
        className="l-navbar"
        id="nav-bar"
        onMouseOver={() =>
          document.getElementById("nav-bar").classList.add("show")
        }
        onMouseOut={() =>
          document.getElementById("nav-bar").classList.remove("show")
        }
      >
        <nav className="nav">
          <div>
            <a href="#" className="nav_logo">
              <i className="bx bx-layer nav_logo-icon"></i>
              <span className="nav_logo-name">Icee Electronics</span>
            </a>
            <div className="nav_list">
              {routes[role] && routes[role].map((route, index) => (
                <a key={index} href={route.path} className="nav_link">
                  <i className={`fa-solid ${route.icon}`}></i>
                  <span className="nav_name">{route.name}</span>
                </a>
              ))}
              {console.log(username)}
              {console.log(role)}
            </div>
          </div>
          <button className="nav_link" onClick={handleLogout}>
            <i className="bx bx-log-out nav_icon"></i>
          </button>
        </nav>
      </div>
      <div className="height-100 bg-light"></div>
    </div>
  );
};

export default Navbar;
