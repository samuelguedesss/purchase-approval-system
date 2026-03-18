import { Router } from 'express';
import UserController from '../controller/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import authorizeRoles from '../middlewares/roleMiddleware.js'

const router = Router();

router.get('/', authMiddleware, UserController.getUsers);
router.post('/', authMiddleware, authorizeRoles('GENERAL_MANAGER'), UserController.createUser);

export default router
