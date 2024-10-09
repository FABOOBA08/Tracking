import express from 'express';
import cajaController from '../Controllers/Caja.Controller.js';
import authMiddleware from '../middleware/Auth.Middleware.js';

const router = express.Router();


router.get('/',authMiddleware, cajaController.getAllCajas); 
router.get('/:idcaja',authMiddleware, cajaController.getCajaById);
router.post('/',authMiddleware, cajaController.createCaja);
router.put('/:idcaja',authMiddleware, cajaController.updateCaja);
router.put('/:idcaja/cerrar', authMiddleware, cajaController.cerrarCaja); // Nueva ruta para cerrar cajas
router.delete('/:idcaja',authMiddleware, cajaController.deleteCaja);

export default router;
