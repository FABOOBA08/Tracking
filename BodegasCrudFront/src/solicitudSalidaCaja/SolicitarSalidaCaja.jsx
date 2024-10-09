import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import logoImg from '/public/LogoC.png';
import Swal from 'sweetalert2';

const URI = "http://localhost:8000/cajas";
const BODEGAS_URI = "http://localhost:8000/bodegas";
const PIEZAS_URI = "http://localhost:8000/piezas";
const SOLICITUDES_URI = "http://localhost:8000/solicitudes";

const ELEMENTOS_POR_PAGINA = 5;

const SolicitarSalidaCaja = ({ user_id, username }) => {
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
  const [showModal, setShowModal] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchData = async () => {
    try {
      const [cajasRes, bodegasRes, piezasRes] = await Promise.all([
        axios.get(URI),
        axios.get(BODEGAS_URI),
        axios.get(PIEZAS_URI),
      ]);

      const sortedCajas = cajasRes.data.sort((a, b) => b.idcaja - a.idcaja);
      setCajas(sortedCajas);
      setBodegas(bodegasRes.data.bodegas);
      setPiezas(piezasRes.data);
    } catch (err) {
      console.error("Error al obtener datos de cajas", err);
      Swal.fire('Error', 'Error al obtener datos de cajas.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setIdBodega("");
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

  const deleteCaja = async (idcaja) => {
    try {
      const response = await axios.get(`http://localhost:8000/cajas/${idcaja}`);
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
      });if (confirmed) {
        await axios.delete(`${URI}/${idcaja}`);
        fetchData();
        Swal.fire('Eliminado!', 'La caja ha sido eliminada.', 'success');
      }
    } catch (err) {
      console.error("Error al eliminar caja:", err);
      Swal.fire('Error', 'Error al eliminar caja.', 'error');
    }
  };

  const handleShowEditModal = (caja) => {
    if (caja.estado === "abierta") {
      setEditCaja(caja);

      const piezasAsociadas =
        caja.Piezas?.map((pieza) => ({
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
      Swal.fire('Error', 'Cantidad de piezas insuficientes, revisa el stock', 'error');
    }
  };
  const confirmSolicitarSalida = (idcaja) => {
    Swal.fire({
      title: '¿Estás seguro de solicitar la salida de esta caja?',
      /* text: 'Una vez solicitada la salida, no se podrá modificar la caja.', */
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, solicitar salida',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleSolicitarSalida(idcaja);
      }
    });
  };

  const handleSolicitarSalida = async (idcaja) => {
    try {
      const user_id = localStorage.getItem('userid');
      const username = localStorage.getItem('username');
      const response = await axios.get(`${URI}/${idcaja}`);
      const estadoCaja = response.data.estado;
  
      if (estadoCaja === 'solicitada') {
        Swal.fire('Advertencia', 'La caja se encuentra en espera de aprobación', 'warning');
      } else {
        await axios.post(SOLICITUDES_URI, {
          idcaja,
          user_id,
          username,
        });
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error al crear solicitud:", err);
      Swal.fire('Error', 'Error al crear solicitud: Recuerda cerrar la caja antes de solicitarla', 'error');
    }
  };

  const closeCaja = async (idcaja) => {
    try {
      const response = await axios.get(`${URI}/${idcaja}`);
      const caja = response.data;
  
      if (caja.estado === 'solicitada') {
        Swal.fire({
          title: 'Error al cerrar caja',
          text: 'No se puede cerrar una caja en estado "solicitada".',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
  
      Swal.fire({
        title: '¿Desea cerrar la caja?',
        text: "Una vez cerrada, la caja no podrá ser modificada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar caja',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.put(`${URI}/${idcaja}/cerrar`);
            fetchData();
            Swal.fire(
              '¡Caja cerrada!',
              'La caja ha sido cerrada correctamente.',
              'success'
            );
          } catch (err) {
            console.error("Error al cerrar la caja:", err);
            Swal.fire(
              '¡Error!',
              'Hubo un error al cerrar la caja.',
              'error'
            );
          }
        }
      });
    } catch (err) {
      console.error("Error al obtener la información de la caja:", err);
      Swal.fire(
        '¡Error!',
        'Hubo un error al obtener la información de la caja.',
        'error'
      );
    }
  };

  const totalPaginas = Math.ceil(cajas.length / ELEMENTOS_POR_PAGINA);
  const cajasPaginadas = cajas.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };
  const generarPDFCaja = async (caja) => {
    try {
      // Crear un nuevo documento PDF en formato horizontal
      const doc = new jsPDF('landscape');
  
      // Definir los márgenes en cm
      const margen = 30; // Convertir cm a unidades del PDF (aprox 10 unidades por cm)
      const anchoPagina = doc.internal.pageSize.getWidth();
      const altoPagina = doc.internal.pageSize.getHeight();
      const anchoCuadro = anchoPagina - 2 * margen;
      const altoCuadro = altoPagina - 2 * margen;
  
      // Dibujar el cuadro y definir sus dimensiones
      doc.rect(margen, margen, anchoCuadro, altoCuadro);
  
      // Ajustar las coordenadas para el contenido basado en los nuevos márgenes
      const posXIzquierda = margen + 10;
      const posYInicial = margen + 10;
  
      // Agregar el mensaje de división encima de "CAJA N."
      doc.setFont("helvetica", "normal");
      doc.setFontSize(30);
      doc.text("DIVISIÓN: Soporte Hw", posXIzquierda, posYInicial + 10);
  
      // Agregar el ID de la caja con un tamaño de letra más grande
      doc.setFont("helvetica", "bold");
      doc.setFontSize(64);
      doc.text(`CAJA N.${caja.idcaja}`, posXIzquierda, posYInicial + 40);
  
      // Cambiar al estilo normal para el resto de elementos
      doc.setFont("helvetica");
      doc.setFontSize(40);
  
      // Definir la posición inicial para el resto de elementos
      let posY = posYInicial + 70;
  
      // Agregar el título "CONTENIDO" en negrita
      doc.setFont("helvetica", "bold");
      doc.text("CONTENIDO:", posXIzquierda, posY);
      posY += 5;
  
      // Preparar los datos para la tabla
      const tableData = caja.Piezas.map(pieza => [pieza.nombre, pieza.CajaPieza.cantidad]);
  
      // Agregar la tabla
      doc.autoTable({
        head: [['Nombre de la Pieza', '|Cantidad']],
        body: tableData,
        startY: posY,
        margin: { left: posXIzquierda, right: margen }, // Ajustar los márgenes de la tabla
        tableWidth: 'wrap', // Ajustar el ancho de la tabla al contenido
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Cabecera negra con letra blanca
        styles: { fontSize: 15 },
      });
  
      // Ajustar la posición del logo ligeramente hacia abajo y hacia la izquierda
      const logoWidth = 60; // Ancho del logo en unidades del PDF
      const logoHeight = 35; // Alto del logo en unidades del PDF
      const logoPosX = anchoPagina - margen - logoWidth - 10; // Posición X del logo (desplazado 10 unidades hacia la izquierda)
      const logoPosY = margen + 10; // Posición Y del logo (desplazado 10 unidades hacia abajo)
      doc.addImage(logoImg, 'PNG', logoPosX, logoPosY, logoWidth, logoHeight);
  
      // Guardar el PDF con un nombre único
      doc.save(`Caja_${caja.idcaja}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF de caja:", err);
    }
  };
  
  
  return (
    <div>
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
              <th colSpan="3">Opciones</th>
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
                    <div key={pieza.idpieza}>{pieza.CajaPieza.cantidad}</div>
                  ))}
                </td>
                <td>{caja.Bodega?.nombre}</td>
                <td>
                  <Button
                    className="btn btn-primary"
                    onClick={() => handleShowEditModal(caja)}
                  >
                    <i className="fa-solid fa-pencil"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-secondary"
                    onClick={() => closeCaja(caja.idcaja)}
                  >
                    <i className="fa-solid fa-lock"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-warning"
                    onClick={() => confirmSolicitarSalida(caja.idcaja)}
                  >
                    <i className="fa-solid fa-box-open"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    className="btn btn-info"
                    onClick={() => generarPDFCaja(caja)}
                  >
                    <i className="fa-solid fa-print"></i>
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

export default SolicitarSalidaCaja;
