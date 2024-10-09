import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const SOLICITUDES_URI = "http://localhost:8000/solicitudes";
const ELEMENTOS_POR_PAGINA = 5;

const SolicitudesList = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [alertShown, setAlertShown] = useState(false); // Nuevo estado

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    if (!alertShown && solicitudes.some(solicitud => solicitud.estado === "pendiente")) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Hay solicitudes en estado pendiente.'
      });
      setAlertShown(true); // Marcar que la alerta ya se mostró
    }
  }, [solicitudes, alertShown]);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get(SOLICITUDES_URI);
      // Ordenar las solicitudes por ID en orden descendente
      const sortedSolicitudes = res.data.sort((a, b) => b.idsolicitud - a.idsolicitud);
      setSolicitudes(sortedSolicitudes);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
      Swal.fire('Error', 'Error al obtener solicitudes', 'error');
    }
  };

  const exportarExcel = async () => {
    try {
      const res = await axios.get(`${SOLICITUDES_URI}/exportar`, {
        responseType: 'blob',
      });
      saveAs(res.data, 'Solicitudes.xlsx');
      Swal.fire('Éxito', 'Solicitudes exportadas correctamente', 'success');
    } catch (err) {
      console.error('Error al exportar solicitudes:', err);
      Swal.fire('Error', 'Error al exportar solicitudes', 'error');
    }
  };

  const confirmarAccion = async (accion, solicitud) => {
    const mensaje =
      accion === "aprobar"
        ? "¿Está seguro de aprobar la solicitud?"
        : "¿Está seguro de rechazar la solicitud?";
    const result = await Swal.fire({
      title: 'Confirmar',
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      if (accion === "aprobar") {
        handleAprobarSolicitud(solicitud);
      } else if (accion === "rechazar") {
        handleRechazarSolicitud(solicitud);
      }
    }
  };

  const handleAprobarSolicitud = async (solicitud) => {
    try {
      const aprobador_id = localStorage.getItem("userid");
      const aprobador_username = localStorage.getItem("username");

      await axios.put(`${SOLICITUDES_URI}/solicitudes/aprobar`, {
        idsolicitud: solicitud.idsolicitud,
        aprobador_id,
        aprobador_username,
      });

      fetchSolicitudes();
      Swal.fire('Éxito', 'Solicitud aprobada correctamente', 'success');
    } catch (err) {
      console.error("Error al aprobar solicitud:", err);
      Swal.fire('Error', `Error al aprobar solicitud: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleRechazarSolicitud = async (solicitud) => {
    try {
      const aprobador_id = localStorage.getItem("userid");
      const aprobador_username = localStorage.getItem("username");

      await axios.put(`${SOLICITUDES_URI}/solicitudes/rechazar`, {
        idsolicitud: solicitud.idsolicitud,
        aprobador_id,
        aprobador_username,
      });

      fetchSolicitudes(); // Actualiza la lista de solicitudes
      Swal.fire('Éxito', 'Solicitud rechazada correctamente', 'success');
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
      Swal.fire('Error', `Error al rechazar solicitud: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const totalPaginas = Math.ceil(solicitudes.length / ELEMENTOS_POR_PAGINA);
  const solicitudesPaginadas = solicitudes.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA
  );

  return (
    <div>
      <h1 className="display-1">Gestión Solicitudes</h1>
      <Button onClick={exportarExcel} className="mb-3 btn btn-success"><i className="fa-solid fa-file-excel"></i> Exportar </Button>
      <table className="table">
        <thead className="table-dark">
          <tr>
            <th>Solicitud #</th>
            <th>Caja #</th>
            <th>Solicita</th>
            <th>Creada</th>
            <th>Estado</th>
            <th>Aprueba</th>
            <th>Respuesta</th>
            <th>Aprobar</th>
            <th>Rechazar</th>
          </tr>
        </thead>
        <tbody>
          {solicitudesPaginadas.map((solicitud) => (
            <tr key={solicitud.idsolicitud}>
              <td>{solicitud.idsolicitud}</td>
              <td>{solicitud.idcaja}</td>
              <td>
                {solicitud.Solicitante
                  ? solicitud.Solicitante.username
                  : "Desconocido"}
              </td>
              <td>{solicitud.fecha_solicitud}</td>
              <td>{solicitud.estado}</td>
              <td>{solicitud.Aprobador ? solicitud.Aprobador.username : ""}</td>
              <td>{solicitud.fecha_aprobacion || "Pendiente"}</td>
              <td>
                <Button
                  className="btn btn-success"
                  onClick={() => confirmarAccion("aprobar", solicitud)}
                  disabled={solicitud.estado !== "pendiente"}
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                </Button>
              </td>
              <td>
                <Button
                  className="btn btn-danger"
                  onClick={() => confirmarAccion("rechazar", solicitud)}
                  disabled={solicitud.estado !== "pendiente"}
                >
                  <i className="fa-solid fa-thumbs-down"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        <Button
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          <i className="fa-solid fa-backward"></i>
        </Button>
        <span>
          Página {paginaActual} de {totalPaginas}
        </span>
        <Button
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          <i className="fa-solid fa-forward"></i>
        </Button>
      </div>
    </div>
  );
};

export default SolicitudesList;
