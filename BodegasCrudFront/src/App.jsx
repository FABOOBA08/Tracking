import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./context/ProtectedRoute.jsx"; // Importa el componente ProtectedRoute
import BodegaList from "./bodegas/bodegas";
import PiezaList from "./piezas/piezas";
import UsuarioList from "./usuarios/usuarios";
import CajasList from './cajas/cajas';
import Layout from "./navbar/Layout";
import SolicitarSalidaCaja from "./solicitudSalidaCaja/SolicitarSalidaCaja";
import SolicitudesList from './solicitudes/solicitudes.jsx';
import Login from "./login/Login.jsx";
import "./App.css";
import axios from "axios";


function App() {

  // Configuración global de Axios para incluir el token en los encabezados de autorización
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData && userData.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  }

  // Resto de tu código de configuración

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          exact
          path="/BodegaList"
          element={
            <ProtectedRoute>
              <Layout>
                <BodegaList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/PiezaList"
          element={
            <ProtectedRoute>
              <Layout>
                <PiezaList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/UsuarioList"
          element={
            <ProtectedRoute>
              <Layout>
                <UsuarioList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/CajasList"
          element={
            <ProtectedRoute>
              <Layout>
                <CajasList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/SolicitarSalidaCaja"
          element={
            <ProtectedRoute>
              <Layout>
                <SolicitarSalidaCaja />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          exact
          path="/SolicitudesList"
          element={
            <ProtectedRoute>
              <Layout>
                <SolicitudesList />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
