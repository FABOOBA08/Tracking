import { Caja, CajaPieza } from "../Models/Caja.Model.js"; // Verifica si estos modelos están siendo exportados correctamente
import Pieza from "../Models/Pieza.Model.js"; // Asegúrate de que la ruta es correcta
import Bodega from "../Models/Bodega.Model.js";
import Solicitud from "../Models/Solicitud.Model.js";
import User from "../Models/User.Model.js";
import ExcelJS from 'exceljs';

const cajaController = {
  // Obtener todas las cajas
  async getAllCajas(req, res) {
    try {
      const cajas = await Caja.findAll({
        attributes: ["idcaja", "estado", "idbodega"],
        include: [
          {
            model: Pieza,
            through: { model: CajaPieza },
            attributes: ["idpieza", "nombre", "serial", "cantidad"],
          },
          { model: Bodega, attributes: ["nombre"] },
        ],
      });

      res.json(cajas);
    } catch (error) {
      console.error("Error al obtener cajas:", error);
      res.status(500).json({ message: "Error al obtener cajas" });
    }
  },

  // Crear una nueva caja
  async createCaja(req, res) {
    try {
      const { idbodega } = req.body; // Datos para crear la caja

      // Crear la caja con solo la bodega
      const newCaja = await Caja.create({ idbodega });

      res.status(201).json(newCaja); // Caja creada con éxito
    } catch (error) {
      console.error("Error al crear la caja:", error);
      res.status(500).json({ message: "Error al crear la caja" });
    }
  },
  // Obtener una caja por ID
  async getCajaById(req, res) {
    try {
      const { idcaja } = req.params;

      const caja = await Caja.findByPk(idcaja, {
        include: [
          {
            model: Pieza,
            through: CajaPieza,
            attributes: ["nombre", "serial", "cantidad"],
          },
          { model: Bodega, attributes: ["nombre"] },
        ],
      });

      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada." });
      }

      res.json(caja); // Devuelve la caja encontrada
    } catch (error) {
      console.error("Error al obtener la caja:", error);

      res
        .status(500)
        .json({ message: "Error interno. No se pudo obtener la caja." });
    }
  },

  async updateCaja(req, res) {
    try {
      const { idcaja } = req.params;
      const { idbodega, piezas } = req.body; // Piezas para actualizar y agregar

      // Encuentra la caja con todas sus piezas asociadas
      const caja = await Caja.findByPk(idcaja, {
        include: [{ model: Pieza, through: CajaPieza }],
      });

      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada" });
      }

      // Actualiza la bodega si se proporcionó
      if (idbodega) {
        await caja.update({ idbodega });
        console.log(
          `Bodega actualizada para la caja con ID ${idcaja}: ${idbodega}`
        );
      }

      // Itera sobre cada pieza que se debe agregar o actualizar
      for (const piezaData of piezas) {
        console.log(`Editando pieza: ${JSON.stringify(piezaData)}`); // Muestra los datos de la pieza que estás editando
        const pieza = await Pieza.findByPk(piezaData.idpieza);

        if (!pieza) {
          return res.status(404).json({ message: "Pieza no encontrada" });
        }

        // Calcular la nueva cantidad de piezas en la tabla `Piezas`
        const nuevaCantidadPiezas = pieza.cantidad - piezaData.cantidad;

        // Verificar si la nueva cantidad de piezas es negativa
        if (nuevaCantidadPiezas < 0) {
          return res.status(400).json({
            message: `No hay suficientes piezas disponibles para ${pieza.nombre}.`,
          });
        }

        // Actualizar la cantidad de piezas en la tabla `Piezas`
        await pieza.update({ cantidad: nuevaCantidadPiezas });

        // Encuentra la relación `CajaPieza`
        const cajaPieza = caja.Piezas.find(
          (p) => p.CajaPieza.idpieza === piezaData.idpieza
        );

        if (cajaPieza) {
          // Actualizar la cantidad en `CajaPieza`
          const nuevaCantidadCajaPieza =
            cajaPieza.CajaPieza.cantidad + piezaData.cantidad;
          console.log("Actualizando CajaPieza:", {
            cantidad: nuevaCantidadCajaPieza,
          });
          await cajaPieza.CajaPieza.update({
            cantidad: nuevaCantidadCajaPieza,
          });
        } else {
          // Si no existe, crea una nueva entrada para `CajaPieza`
          console.log("Creando nueva entrada en CajaPieza:", {
            idcaja,
            idpieza: piezaData.idpieza,
            cantidad: piezaData.cantidad,
          });
          await CajaPieza.create({
            idcaja,
            idpieza: piezaData.idpieza,
            cantidad: piezaData.cantidad,
          });
        }
      }

      res.json(caja); // Devuelve la caja actualizada
    } catch (error) {
      console.error("Error al actualizar la caja:", error);
      res.status(500).json({ message: "Error al actualizar la caja" });
      
    }
  },

  // Eliminar una caja por su ID
  async deleteCaja(req, res) {
    try {
      const { idcaja } = req.params;

      const caja = await Caja.findByPk(idcaja, {
        include: [{ model: Pieza, through: { model: CajaPieza } }],
      });

      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada" });
      }

      // Ajustar el stock de las piezas antes de eliminar la caja
      if (caja.CajaPiezas) {
        // Verifica que CajaPiezas esté definido
        for (const cp of caja.CajaPiezas) {
          const pieza = await Pieza.findByPk(cp.idpieza);

          if (pieza) {
            await pieza.update({
              cantidad: pieza.cantidad + cp.cantidad,
            });
          }
        }
      }

      await CajaPieza.destroy({ where: { idcaja } });
      await caja.destroy();

      res.json({ message: "Caja eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la caja:", error);
      res.status(500).json({ message: "Error al eliminar la caja" });
    }
  },
  cerrarCaja: async (req, res) => {
    const { idcaja } = req.params;

    try {
      const caja = await Caja.findByPk(idcaja); // Asegúrate de ajustar esto a tu método de búsqueda según tu ORM/ODM

      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada" });
      }

      caja.estado = "cerrada";
      await caja.save();

      return res.status(200).json({ message: "Caja cerrada exitosamente" });
    } catch (error) {
      console.error("Error al cerrar la caja:", error);
      return res.status(500).json({ message: "Error al cerrar la caja" });
    }
  },

  async createSolicitud(req, res) {
    try {
      const { idcaja } = req.body;

      // Verificar que el user_id esté presente en el cuerpo de la solicitud
      const user_id = req.user.userId; // Este es el ID del usuario obtenido del token decodificado
      const solicitante_username = req.user.username;
      console.log("Id de solicitante", user_id);

      // Verificar si la caja existe
      const caja = await Caja.findByPk(idcaja);
      if (!caja) {
        return res.status(404).json({ message: "Caja no encontrada" });
      }

      // Verificar si la caja está en estado "abierta" para poder ser solicitada
      if (caja.estado !== "cerrada") {
        return res
          .status(400)
          .json({ message: "La caja no puede ser solicitada" });
      }

      // Crear la solicitud
      const solicitud = await Solicitud.create({
        idcaja,
        solicitante_id: user_id,
        solicitante_username,
      });

      // Cambiar el estado de la caja a "solicitada"
      await caja.update({ estado: "solicitada" });

      // Devolver la solicitud creada como respuesta
      res.status(201).json(solicitud);
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      res.status(500).json({ message: "Error al crear la solicitud" });
    }
  },

  async getSolicitudes(req, res) {
    try {
      // Obtener todas las solicitudes con información adicional
      const solicitudes = await Solicitud.findAll({
        include: [
          { model: User, as: "Solicitante", attributes: ["username"] },
          { model: User, as: "Aprobador", attributes: ["username"] },
          { model: Caja, attributes: ["idcaja"] },
        ],
        attributes: [
          "idsolicitud",
          "estado",
          "fecha_solicitud",
          "fecha_aprobacion",
          "solicitante_id",
          "aprobador_id",
          "solicitante_username",
          "aprobador_username",
          "idcaja", // Añadir el idcaja a los atributos seleccionados
        ],
      });

      // Devolver las solicitudes encontradas
      res.json(solicitudes);
    } catch (error) {
      console.error("Error al obtener las solicitudes:", error);
      res.status(500).json({ message: "Error al obtener las solicitudes" });
    }
  },

  // controller file
  async aprobarSolicitud(req, res) {
    try {
      const { idsolicitud } = req.body;
      const aprobador_id = req.user.userId; // Este es el ID del usuario obtenido del token decodificado
      const aprobador_username = req.user.username;
      
      // Verificar si la solicitud existe
      const solicitud = await Solicitud.findByPk(idsolicitud);
      if (!solicitud) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }
  
      // Verificar si la solicitud está en estado "pendiente"
      if (solicitud.estado !== "pendiente") {
        return res.status(400).json({ message: "La solicitud no está en estado pendiente" });
      }
  
      // Actualizar la solicitud con el estado "aprobada", aprobador_id y aprobador_username
      await solicitud.update({
        estado: "aprobada",
        aprobador_id: aprobador_id,  // Corrige el nombre de la variable aquí
        aprobador_username: aprobador_username,  // Corrige el nombre de la variable aquí
        fecha_aprobacion: new Date(),
      });
  
      // Cambiar el estado de la caja asociada a "abierta"
      await Caja.update(
        { estado: "abierta" },
        { where: { idcaja: solicitud.idcaja } }
      );
  
      // Devolver la solicitud actualizada como respuesta
      res.json(solicitud);
    } catch (error) {
      console.error("Error al aprobar la solicitud:", error);
      res.status(500).json({ message: "Error al aprobar la solicitud" });
    }
  },
  async  exportarSolicitudesExcel(req, res) {
    try {
      // Obtener todas las solicitudes con información adicional
      const solicitudes = await Solicitud.findAll({
        include: [
          { model: User, as: 'Solicitante', attributes: ['username'] },
          { model: User, as: 'Aprobador', attributes: ['username'] },
          { model: Caja, attributes: ['idcaja'] },
        ],
        attributes: [
          'idsolicitud',
          'estado',
          'fecha_solicitud',
          'fecha_aprobacion',
          'solicitante_id',
          'aprobador_id',
          'solicitante_username',
          'aprobador_username',
          'idcaja',
        ],
      });
  
      // Crear un nuevo libro de trabajo
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Solicitudes');
  
      // Añadir encabezados
      worksheet.columns = [
        { header: 'Solicitud #', key: 'idsolicitud', width: 10 },
        { header: 'Caja #', key: 'idcaja', width: 10 },
        { header: 'Solicita', key: 'solicitante_username', width: 30 },
        { header: 'Creada', key: 'fecha_solicitud', width: 20 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Aprueba', key: 'aprobador_username', width: 30 },
        { header: 'Respuesta', key: 'fecha_aprobacion', width: 20 },
      ];
  
      // Añadir filas
      solicitudes.forEach((solicitud) => {
        worksheet.addRow(solicitud);
      });
  
      // Generar el archivo Excel en buffer
      const buffer = await workbook.xlsx.writeBuffer();
  
      // Enviar el archivo al cliente
      res.setHeader('Content-Disposition', 'attachment; filename=Solicitudes.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error al exportar solicitudes:', error);
      res.status(500).json({ message: 'Error al exportar solicitudes' });
    }
  },

  async rechazarSolicitud(req, res) {
    try {
      const { idsolicitud } = req.body;
      const aprobador_id = req.user.userId; 
      const aprobador_username = req.user.username;


      // Verificar si la solicitud existe
      const solicitud = await Solicitud.findByPk(idsolicitud);
      if (!solicitud) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }

      // Verificar si la solicitud está en estado "pendiente"
      if (solicitud.estado !== "pendiente") {
        return res
          .status(400)
          .json({ message: "La solicitud no está en estado pendiente" });
      }

      // Actualizar la solicitud con el estado "rechazada" y el aprobador_id
      await solicitud.update({
        estado: "rechazada",
        aprobador_id: aprobador_id,  // Corrige el nombre de la variable aquí
        aprobador_username: aprobador_username,  // Corrige el nombre de la variable aquí
        fecha_aprobacion: new Date(),
      });

      // Cambiar el estado de la caja asociada a "cerrada"
      await Caja.update(
        { estado: "cerrada" },
        { where: { idcaja: solicitud.idcaja } }
      );

      // Devolver la solicitud actualizada como respuesta
      res.json(solicitud);
    } catch (error) {
      console.error("Error al rechazar la solicitud:", error);
      res.status(500).json({ message: "Error al rechazar la solicitud" });
    }
  },
  
};

export default cajaController;
