import Router from "express";
import piezaController from "../Controllers/Pieza.Controller.js";
import authMiddleware from '../middleware/Auth.Middleware.js';

const router = Router(); // Define el enrutador

router.get("/",authMiddleware, piezaController.getAllPiezas); // Obtener todas las piezas
router.get("/:idpieza",authMiddleware, piezaController.getPiezaById); // Obtener pieza por ID
router.put("/:idpieza",authMiddleware, piezaController.updatePieza); // Actualizar pieza por ID
router.delete("/:idpieza",authMiddleware, piezaController.deletePieza); // Eliminar pieza por ID
router.post("/",authMiddleware, piezaController.createPieza); // Crear una nueva pieza
export default router; // Exporta el enrutador
