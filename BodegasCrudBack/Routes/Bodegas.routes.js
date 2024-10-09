import Router from 'express';
import bodegaController from '../Controllers/Bodega.Controller.js';
import authMiddleware from '../middleware/Auth.Middleware.js';

const router = Router(); // Define el enrutador

// NOTA: Cambiar el nombre de las rutas para incluir un '/' entre la ruta y el parámetro
router.get('/',authMiddleware, bodegaController.getAllBodegas); // Obtener todas las bodegas
router.get('/:idbodega',authMiddleware, bodegaController.getBodega); // Obtener una bodega por ID
router.put('/:idbodega',authMiddleware, bodegaController.updateBodega); // Actualizar una bodega por ID
router.delete('/:idbodega',authMiddleware, bodegaController.deleteBodega); // Eliminar una bodega por ID
router.post('/',authMiddleware, bodegaController.createBodega); // Crear una nueva bodega



export default router; 