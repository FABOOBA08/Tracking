import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2';

const URI = "http://localhost:8000/piezas";
const ELEMENTOS_POR_PAGINA = 5;

const PiezaList = () => {
  const [piezas, setPiezas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [serial, setSerial] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [editPieza, setEditPieza] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchPiezas = async (query = "") => {
    try {
      const res = await axios.get(`${URI}?query=${query}`);
      setPiezas(res.data);
    } catch (err) {
      console.error("Error al obtener piezas:", err);
      Swal.fire('Error', 'Error al obtener piezas.', 'error');
    }
  };

  useEffect(() => {
    fetchPiezas(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPaginaActual(1); // Resetear a la primera página en cada búsqueda
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNombre("");
    setSerial("");
    setCantidad("");
  };

  const handleShowEditModal = (pieza) => {
    setEditPieza(pieza);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPieza(null);
  };

  const deletePieza = async (idpieza) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${URI}/${idpieza}`);
        fetchPiezas(searchQuery);
        Swal.fire('Eliminado!', 'La pieza ha sido eliminada.', 'success');
      } catch (err) {
        console.error("Error al eliminar pieza:", err);
        Swal.fire('Error', 'Error al eliminar pieza.', 'error');
      }
    }
  };

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };

  const handleSerialChange = (e) => {
    setSerial(e.target.value);
  };

  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const totalPaginas = Math.ceil(piezas.length / ELEMENTOS_POR_PAGINA);
  const piezasPaginadas = piezas.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA
  );

  return (
    <div className="full-container">
      <h1 className="display-1">Gestión Piezas</h1>
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control"
            placeholder="Buscar por nombre..."
          />
        </div>
      </div>
      <div className="row">
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Serial</th>
              <th>Cantidad</th>
              <th>Opciones</th>
              <th>
                <Button
                  className="btn btn-success"
                  onClick={handleShowCreateModal}
                >
                  <i className="fa-solid fa-plus"></i>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {piezasPaginadas.map((pieza) => (
              <tr key={pieza.idpieza}>
                <td>{pieza.idpieza}</td>
                <td>{pieza.nombre}</td>
                <td>{pieza.serial}</td>
                <td>{pieza.cantidad}</td>
                <td>
                  <Button
                    className="btn btn-primary"
                    onClick={() => handleShowEditModal(pieza)}
                  >
                    <i className="fa-solid fa-pencil"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-danger"
                    onClick={() => deletePieza(pieza.idpieza)}
                  >
                    <i className="fa-solid fa-eraser"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <Modal.Title>Crear Pieza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post(URI, { nombre, serial, cantidad });
                fetchPiezas(searchQuery); // Actualizar la lista después de crear
                handleCloseCreateModal();
                Swal.fire('Éxito', 'Pieza creada con éxito.', 'success');
              } catch (err) {
                console.error("Error al crear pieza:", err);
                Swal.fire('Error', 'Error al crear pieza.', 'error');
              }
            }}
          >
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={handleNombreChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Serial</label>
              <input
                type="text"
                value={serial}
                onChange={handleSerialChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={handleCantidadChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {editPieza && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Pieza</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`${URI}/${editPieza.idpieza}`, {
                    nombre: editPieza.nombre,
                    serial: editPieza.serial,
                    cantidad: editPieza.cantidad,
                  });
                  fetchPiezas(searchQuery);
                  handleCloseEditModal();
                  Swal.fire('Éxito', 'Pieza editada con éxito.', 'success');
                } catch (err) {
                  console.error("Error al editar pieza:", err);
                  Swal.fire('Error', 'Error al editar pieza.', 'error');
                }
              }}
            >
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  value={editPieza.nombre}
                  onChange={(e) =>
                    setEditPieza({ ...editPieza, nombre: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Serial</label>
                <input
                  type="text"
                  value={editPieza.serial}
                  onChange={(e) =>
                    setEditPieza({ ...editPieza, serial: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  value={editPieza.cantidad}
                  onChange={(e) =>
                    setEditPieza({ ...editPieza, cantidad: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default PiezaList;
