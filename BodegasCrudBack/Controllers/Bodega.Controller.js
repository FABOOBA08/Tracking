import BodegaModel from "../Models/Bodega.Model.js";
import { Op } from "sequelize";

const bodegaController = {
  //NOTA Obtener todas las bodegas
  async getAllBodegas(req, res) {
    try {
      const { search = "" } = req.query;
      const query = search ? { nombre: { [Op.like]: `%${search}%` } } : {};
      const bodegas = await BodegaModel.findAll({ where: query });
      res.json({
        bodegas,
        totalItems: bodegas.length,
        totalPages: 1,
        currentPage: 1,
      });
    } catch (error) {
      console.error("Error al obtener bodegas:", error);
      res.status(500).json({ message: "Error al obtener bodegas" });
    }
  },

  //NOTA Obtener una bodega por ID
  async getBodega(req, res) {
    try {
      const { idbodega } = req.params;
      const bodega = await BodegaModel.findByPk(idbodega);

      if (!bodega) {
        return res.status(404).json({ message: "Bodega no encontrada" });
      }

      res.json(bodega);
    } catch (error) {
      console.error("Error al obtener la bodega:", error);
      res.status(500).json({ message: "Error al obtener la bodega" });
    }
  },

  //NOTA Crear una nueva bodega
  async createBodega(req, res) {
    try {
      const { nombre } = req.body;

      // Verificación de existencia previa, si es necesario
      const existingBodega = await BodegaModel.findOne({ where: { nombre } });
      if (existingBodega) {
        return res.status(400).json({ message: "La bodega ya existe" });
      }

      const newBodega = await BodegaModel.create({ nombre });

      res.status(201).json(newBodega);
    } catch (error) {
      console.error("Error al crear bodega:", error);
      res.status(500).json({ message: "Error al crear bodega" });
    }
  },

  //NOTA Actualizar una bodega
  async updateBodega(req, res) {
    try {
      const { idbodega } = req.params; // ID para buscar la bodega
      const { nombre } = req.body;

      const bodega = await BodegaModel.findByPk(idbodega);

      if (!bodega) {
        return res.status(404).json({ message: "Bodega no encontrada" });
      }

      await bodega.update({ nombre });

      res.json(bodega);
    } catch (error) {
      console.error("Error al actualizar bodega:", error);
      res.status(500).json({ message: "Error al actualizar bodega" });
    }
  },

  //NOTA Eliminar una bodega
  async deleteBodega(req, res) {
    try {
      const { idbodega } = req.params;
      const bodega = await BodegaModel.findByPk(idbodega);

      if (!bodega) {
        return res.status(404).json({ message: "Bodega no encontrada" }); // Si no se encuentra
      }

      await bodega.destroy(); // Elimina la bodega

      res.json({ message: "Bodega eliminada correctamente" }); // Mensaje de éxito
    } catch (error) {
      console.error("Error al eliminar la bodega:", error);
      res.status(500).json({ message: "Error al eliminar la bodega" });
    }
  },
};

export default bodegaController;
