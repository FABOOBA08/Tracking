import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2';

const URI = "http://localhost:8000/cajas";
const BODEGAS_URI = "http://localhost:8000/bodegas";
const PIEZAS_URI = "http://localhost:8000/piezas";
const ELEMENTOS_POR_PAGINA = 5;

const CajasList = () => {
  const [cajas, setCajas] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [idbodega, setIdBodega] = useState("");
  const [editCaja, setEditCaja] = useState(null);
  const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cajasRes, bodegasRes, piezasRes] = await Promise.all([
        axios.get(URI),
        axios.get(BODEGAS_URI),
        axios.get(PIEZAS_URI),
      ]);

      setCajas(cajasRes.data);
      setBodegas(bodegasRes.data.bodegas); // Ajusta para acceder a la propiedad correcta de la respuesta
      setPiezas(piezasRes.data);
    } catch (err) {
      console.error("Error al obtener datos de cajas", err);
      Swal.fire('Error', 'Error al obtener datos de cajas.', 'error');
    }
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setIdBodega("");
    setPiezasSeleccionadas([]);
  };

  const deleteCaja = async (idcaja) => {
    try {
      const response = await axios.get(`${URI}/${idcaja}`);
      const caja = response.data;

      if (caja.estado !== "abierta") {
        Swal.fire('Aviso', `Estado actual: ${caja.estado}, recuerda que la caja se debe encontrar abierta para ser eliminada.`, 'warning');
        return;
      }

      const confirmed = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'No, cancelar!',
        reverseButtons: true
      });

      if (confirmed.isConfirmed) {
        await axios.delete(`${URI}/${idcaja}`);
        fetchData();
        Swal.fire('Eliminado!', 'La caja ha sido eliminada.', 'success');
      }
    } catch (err) {
      console.error("Error al eliminar caja:", err);
      Swal.fire('Error', 'Error al eliminar caja.', 'error');
    }
  };

  const handleCreateCaja = async (e) => {
    e.preventDefault();

    try {
      const newCaja = {
        idbodega,
        piezas: piezasSeleccionadas.map((pieza) => ({
          idpieza: pieza.idpieza,
          cantidad: pieza.cantidad,
        })),
      };

      await axios.post(URI, newCaja);
      fetchData();
      handleCloseCreateModal();
      Swal.fire('Éxito', 'Caja creada con éxito.', 'success');
    } catch (err) {
      console.error("Error al crear caja:", err);
      Swal.fire('Error', 'Error al crear caja.', 'error');
    }
  };

  const handleShowEditModal = (caja) => {
    if (caja.estado === "abierta") {
      setEditCaja(caja);

      const piezasAsociadas = caja.Piezas?.map((pieza) => ({
        idpieza: pieza.idpieza,
        nombre: pieza.nombre,
        cantidad: pieza.cantidad,
      })) || [];

      setPiezasSeleccionadas(piezasAsociadas);
      setPiezaSeleccionada(null);
      setCantidadSeleccionada(1);
      setShowEditModal(true);
    } else {
      Swal.fire('Aviso', `Estado actual: ${caja.estado}, recuerda que la caja se debe encontrar abierta para realizar modificaciones.`, 'warning');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditCaja(null);
    setPiezasSeleccionadas([]);
  };

  const handleEditCaja = async (e) => {
    e.preventDefault();

    try {
      const piezasParaActualizar = editCaja.Piezas?.map((pieza) => ({
        idpieza: pieza.idpieza,
        cantidad:
          pieza.cantidad -
          (piezasSeleccionadas.find((p) => p.idpieza === pieza.idpieza)
            ?.cantidad || 0),
      }));

      const piezasFinales = piezasParaActualizar.slice();

      if (piezaSeleccionada) {
        piezasFinales.push({
          idpieza: piezaSeleccionada.idpieza,
          cantidad: cantidadSeleccionada,
        });
      }

      const updatedCaja = {
        idbodega: editCaja.idbodega,
        piezas: piezasFinales,
      };

      const cleanedPiezas = updatedCaja.piezas.filter(
        (pieza) => pieza.cantidad > 0
      );
      updatedCaja.piezas = cleanedPiezas;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      await axios.put(`${URI}/${editCaja.idcaja}`, updatedCaja, config);
      fetchData();
      handleCloseEditModal();
      Swal.fire('Éxito', 'Caja editada con éxito.', 'success');
    } catch (err) {
      console.error("Error al editar caja:", err);
      Swal.fire('Error', 'Error al editar caja.', 'error');
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const totalPaginas = Math.ceil(cajas.length / ELEMENTOS_POR_PAGINA);
  const cajasPaginadas = cajas.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA
  );

  return (
    <div className="full-container">
      <h1 className="display-1">Gestión Cajas</h1>
      <table className="table">
        <thead className="table-dark">
          <tr>
            <th>Caja #</th>
            <th>Estado</th>
            <th>Pieza(s)</th>
            <th>Cantidad</th>
            <th>Ubicación</th>
            <th>Opciones</th>
            <th>
              <Button className="btn btn-success" onClick={handleShowCreateModal}>
                <i className="fa-solid fa-plus"></i>
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {cajasPaginadas.map((caja) => (
            <tr key={caja.idcaja}>
              <td>{caja.idcaja}</td>
              <td>{caja.estado}</td>
              <td>
                {caja.Piezas?.map((pieza) => (
                  <div key={pieza.idpieza}>{pieza.nombre}</div>
                ))}
              </td>
              <td>
                {caja.Piezas?.map((pieza) => (
                  <div key={pieza.idpieza}>
                    {pieza.CajaPieza?.cantidad || 0}
                  </div>
                ))}
              </td>
              <td>{caja.Bodega?.nombre || "Desconocido"}</td>
              <td>
                <Button className="btn btn-primary" onClick={() => handleShowEditModal(caja)}>
                  <i className="fa-solid fa-pencil"></i>
                </Button>
              </td>
              <td>
                <Button className="btn btn-danger" onClick={() => deleteCaja(caja.idcaja)}>
                  <i className="fa-solid fa-eraser"></i>
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

      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Caja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreateCaja}>
            <div className="mb-3">
              <label className="form-label">Bodega</label>
              <select
                value={idbodega}
                onChange={(e) => setIdBodega(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Seleccione una bodega</option>
                {Array.isArray(bodegas) &&
                  bodegas.map((bodega) => (
                    <option key={bodega.idbodega} value={bodega.idbodega}>
                      {bodega.nombre}
                    </option>
                  ))}
              </select>
            </div>
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
          </form>
        </Modal.Body>
      </Modal>
      {editCaja && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Caja</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleEditCaja}>
              <div className="mb-3">
                <label className="form-label">Bodega</label>
                <select
                  value={editCaja?.idbodega || ""}
                  onChange={(e) =>
                    setEditCaja({ ...editCaja, idbodega: e.target.value })
                  }
                  className="form-control"
                  required
                >
                  <option value="">Seleccione una bodega</option>
                  {Array.isArray(bodegas) &&
                    bodegas.map((bodega) => (
                      <option key={bodega.idbodega} value={bodega.idbodega}>
                        {bodega.nombre}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-3">
                <h5>Piezas Asociadas</h5>
                <table className="table table-light table-bordered">
                  <thead>
                    <tr>
                      <th className="table-dark">Pieza asociada</th>
                      <th className="table-dark">Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editCaja.Piezas.map((pieza) => (
                      <tr key={pieza.idpieza}>
                        <td className="p-3">{pieza.nombre}</td>
                        <td className="p-3">{pieza.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mb-3">
                <h5>Agregar Nuevas Piezas</h5>{" "}
                <select
                  value={piezaSeleccionada?.idpieza || ""}
                  onChange={(e) => {
                    const pieza = piezas.find(
                      (p) => p.idpieza === parseInt(e.target.value, 10)
                    );
                    setPiezaSeleccionada(pieza);
                    setCantidadSeleccionada(1);
                  }}
                  className="form-control"
                >
                  <option value="">Seleccione una pieza</option>
                  {piezas.map((pieza) => (
                    <option key={pieza.idpieza} value={pieza.idpieza}>
                      {pieza.nombre} ({pieza.serial})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={cantidadSeleccionada}
                  onChange={(e) =>
                    setCantidadSeleccionada(parseInt(e.target.value, 10))
                  }
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-success">
                Guardar Cambios
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default CajasList;
