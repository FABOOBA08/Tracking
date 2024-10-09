import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2';
import Navbar from "../navbar/navbar";

const URI = "http://localhost:8000/usuarios";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [editUsuario, setEditUsuario] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async (query = "") => {
    try {
      const res = await axios.get(`${URI}?query=${query}`);
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      Swal.fire('Error', 'Error al obtener usuarios.', 'error');
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchUsuarios(query);
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setUsername("");
    setName("");
    setLastname("");
    setRole("");
    setPassword("");
  };

  const handleShowEditModal = (usuario) => {
    setEditUsuario(usuario);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUsuario(null);
  };

  const deleteUsuario = async (user_id) => {
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
      try {
        await axios.delete(`${URI}/${user_id}`);
        fetchUsuarios();
        Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        Swal.fire('Error', 'Error al eliminar usuario.', 'error');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = usuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  return (
    <div className="full-container">
      <Navbar></Navbar>
      <h1 className="display-1">Gestión Usuarios</h1>
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
            placeholder="Buscar por nombre de usuario..."
          />
        </div>
      </div>
      <div className="row">
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Rol</th>
              <th>Opciones</th>
              <th>
                <Button className="btn btn-success" onClick={handleShowCreateModal}>
                  <i className="fa-solid fa-plus"></i>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((usuario) => (
              <tr key={usuario.user_id}>
                <td>{usuario.user_id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.name}</td>
                <td>{usuario.lastname}</td>
                <td>{usuario.role}</td>
                <td>
                  <Button
                    className="btn btn-primary"
                    onClick={() => handleShowEditModal(usuario)}
                  >
                    <i className="fa-solid fa-pencil"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-danger"
                    onClick={() => deleteUsuario(usuario.user_id)}
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
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="fa-solid fa-backward"></i>
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="fa-solid fa-forward"></i>
        </Button>
      </div>

      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post(URI, { username, name, lastname, role, password });
                fetchUsuarios();
                handleCloseCreateModal();
                Swal.fire('Éxito', 'Usuario creado con éxito.', 'success');
              } catch (err) {
                console.error("Error al crear usuario:", err);
                Swal.fire('Error', 'Error al crear usuario.', 'error');
              }
            }}
          >
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Coordinador">Coordinador</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

      {editUsuario && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`${URI}/${editUsuario.user_id}`, {
                    username: editUsuario.username,
                    name: editUsuario.name,
                    lastname: editUsuario.lastname,
                    role: editUsuario.role,
                    password: editUsuario.password,
                  });
                  fetchUsuarios();
                  handleCloseEditModal();
                  Swal.fire('Éxito', 'Usuario editado con éxito.', 'success');
                } catch (err) {
                  console.error("Error al editar usuario:", err);
                  Swal.fire('Error', 'Error al editar usuario.', 'error');
                }
              }}
            >
              <div className="mb-3">
                <label className="form-label">Nombre de Usuario</label>
                <input
                  type="text"
                  value={editUsuario.username}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, username: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  value={editUsuario.name}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, name: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  value={editUsuario.lastname}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, lastname: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select
                  value={editUsuario.role}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, role: e.target.value })
                  }
                  className="form-control"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Técnico">Técnico</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="text"
                  value={editUsuario.password}
                  onChange={(e) =>
                    setEditUsuario({ ...editUsuario, password: e.target.value })
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

export default UsuarioList;
