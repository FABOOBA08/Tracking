import Router from 'express';
import userController from '../Controllers/User.Controllers.js';
import authMiddleware from '../middleware/Auth.Middleware.js';
const router = Router(); 

router.get('/',authMiddleware,userController.getAllUsers);
router.get('/:id',authMiddleware, userController.getUserById);
router.put('/:id',authMiddleware, userController.updateUser);
router.delete('/:id',authMiddleware, userController.deleteUser);
router.post('/',authMiddleware, userController.createUser);


export default router; 