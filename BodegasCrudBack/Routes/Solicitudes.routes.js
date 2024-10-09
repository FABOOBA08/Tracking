import express from 'express';
import cajaController from '../Controllers/Caja.Controller.js';
import authMiddleware from '../middleware/Auth.Middleware.js';


const router = express.Router();

router.get('/',authMiddleware, cajaController.getSolicitudes); // Obtener todas las solicitudes, incluidos detalles Obtener todas las solicitudes (para el administrador/coordinador)
router.post('/',authMiddleware, cajaController.createSolicitud); // El técnico crea una solicitud Crear una nueva solicitud para la salida de una caja
router.put('/solicitudes/aprobar',authMiddleware, cajaController.aprobarSolicitud); // Para el administrador/coordinador Aprobar una solicitud específica
router.put('/solicitudes/rechazar',authMiddleware, cajaController.rechazarSolicitud); // Para el administrador/coordinador  Rechazar una solicitud específica
router.get('/exportar', authMiddleware, cajaController.exportarSolicitudesExcel);

export default router; // Asegúrate de exportar las rutas correctamente