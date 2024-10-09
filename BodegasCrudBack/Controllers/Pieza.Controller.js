import Pieza from "../Models/Pieza.Model.js";
import { Op } from "sequelize";

const piezaController = {
  // Obtener todas las piezas
  async getAllPiezas(req, res) {
    try {
      const { query } = req.query; // Obtiene la consulta del parámetro de búsqueda

      // Construir condiciones de búsqueda si hay un parámetro de consulta
      const whereCondition = query
        ? { nombre: { [Op.like]: `%${query}%` } } // Filtra por coincidencia parcial
        : {}; // Sin filtro

      const piezas = await Pieza.findAll({ where: whereCondition }); // Aplica filtro si existe
      res.json(piezas); // Devuelve las piezas (filtradas o no)
    } catch (error) {
      console.error("Error al obtener todas las piezas:", error);
      res.status(500).json({ message: "Error al obtener todas las piezas" });
    }
  },

  // Obtener una pieza por su ID
  async getPiezaById(req, res) {
    try {
      const { idpieza } = req.params; // Obtiene el ID de los parámetros de la solicitud
      const pieza = await Pieza.findByPk(idpieza); // Busca la pieza por su ID

      if (!pieza) {
        return res.status(404).json({ message: "Pieza no encontrada" }); // Maneja el caso cuando no se encuentra
      }

      res.json(pieza); // Devuelve la pieza encontrada
    } catch (error) {
      console.error("Error al obtener la pieza por ID:", error);
      res.status(500).json({ message: "Error al obtener la pieza por ID" });
    }
  },

  // Crear una nueva pieza
  async createPieza(req, res) {
    try {
      const { nombre, serial, cantidad } = req.body; // Obtiene los datos del cuerpo de la solicitud
      const newPieza = await Pieza.create({ nombre, serial, cantidad }); // Crea una nueva pieza

      res.status(201).json(newPieza); // Devuelve la pieza creada
    } catch (error) {
      console.error("Error al crear pieza:", error);
      res.status(500).json({ message: "Error al crear pieza" });
    }
  },

  // Actualizar una pieza por su ID
  async updatePieza(req, res) {
    try {
      const { idpieza } = req.params; // Obtiene el ID de la solicitud
      const { nombre, serial, cantidad } = req.body; // Obtiene los datos a actualizar
      const pieza = await Pieza.findByPk(idpieza); // Busca la pieza por ID

      if (!pieza) {
        return res.status(404).json({ message: "Pieza no encontrada" }); // Maneja el caso cuando no se encuentra
      }

      await pieza.update({ nombre, serial, cantidad }); // Actualiza la pieza

      res.json(pieza); // Devuelve la pieza actualizada
    } catch (error) {
      console.error("Error al actualizar la pieza:", error);
      res.status(500).json({ message: "Error al actualizar la pieza" });
    }
  },

  // Eliminar una pieza por su ID
  async deletePieza(req, res) {
    try {
      const { idpieza } = req.params; // Obtiene el ID de la solicitud
      const pieza = await Pieza.findByPk(idpieza); // Busca la pieza por ID

      if (!pieza) {
        return res.status(404).json({ message: "Pieza no encontrada" }); // Maneja el caso cuando no se encuentra
      }

      await pieza.destroy(); // Elimina la pieza

      res.json({ message: "Pieza eliminada correctamente" }); // Respuesta cuando se elimina correctamente
    } catch (error) {
      console.error("Error al eliminar la pieza:", error);
      res.status(500).json({ message: "Error al eliminar la pieza" });
    }
  },
};

export default piezaController;
