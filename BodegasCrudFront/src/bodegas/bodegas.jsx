import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2';

const URI = "http://localhost:8000/bodegas";
const ELEMENTOS_POR_PAGINA = 5;

const BodegaList = () => {
  const [bodegas, setBodegas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [editBodega, setEditBodega] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetchBodegas(searchQuery);
  }, [searchQuery]);

  const fetchBodegas = async (query = "") => {
    try {
      const res = await axios.get(`${URI}?search=${query}`);
      if (Array.isArray(res.data.bodegas)) {
        setBodegas(res.data.bodegas);
      } else {
        setBodegas([]);
      }
    } catch (err) {
      console.error("Error al obtener bodegas:", err);
      Swal.fire('Error', 'Error al obtener bodegas.', 'error');
    }
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNombre("");
  };

  const handleShowEditModal = (bodega) => {
    setEditBodega(bodega);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditBodega(null);
  };

  const deleteBodega = async (idbodega) => {
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
        await axios.delete(`${URI}/${idbodega}`);
        fetchBodegas(searchQuery);
        Swal.fire('Eliminado!', 'La bodega ha sido eliminada.', 'success');
      } catch (err) {
        console.error("Error al eliminar bodega:", err);
        Swal.fire('Error', 'Error al eliminar bodega.', 'error');
      }
    }
  };

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const totalPaginas = Math.ceil(bodegas.length / ELEMENTOS_POR_PAGINA);
  const bodegasPaginadas = bodegas.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA
  );

  return (
    <div className="full-container">
      <h1 className="display-1">Gestión Bodegas</h1>
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
              <th>Opciones</th>
              <th>
                <Button
                  className="btn btn-success"
                  onClick={handleShowCreateModal}
                >
                  <i className="fa-solid fa-house-chimney-medical"></i>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {bodegasPaginadas.map((bodega) => (
              <tr key={bodega.idbodega}>
                <td>{bodega.idbodega}</td>
                <td>{bodega.nombre}</td>
                <td>
                  <Button
                    className="btn btn-primary"
                    onClick={() => handleShowEditModal(bodega)}
                  >
                    <i className="fa-solid fa-pencil"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-danger"
                    onClick={() => deleteBodega(bodega.idbodega)}
                  >
                    <i className="fa-solid fa-house-circle-xmark"></i>
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
          <Modal.Title>Crear Bodega</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post(URI, { nombre });
                fetchBodegas(searchQuery);
                handleCloseCreateModal();
                Swal.fire('Éxito', 'Bodega creada con éxito.', 'success');
              } catch (err) {
                console.error("Error al crear bodega:", err);
                Swal.fire('Error', 'Error al crear bodega.', 'error');
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
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {editBodega && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Bodega</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`${URI}/${editBodega.idbodega}`, {
                    nombre: editBodega.nombre,
                  });
                  fetchBodegas(searchQuery);
                  handleCloseEditModal();
                  Swal.fire('Éxito', 'Bodega editada con éxito.', 'success');
                } catch (err) {
                  console.error("Error al editar bodega:", err);
                  Swal.fire('Error', 'Error al editar bodega.', 'error');
                }
              }}
            >
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  value={editBodega.nombre}
                  onChange={(e) =>
                    setEditBodega({ ...editBodega, nombre: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                <i className="fa-regular fa-floppy-disk"></i> Guardar Cambios
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default BodegaList;
