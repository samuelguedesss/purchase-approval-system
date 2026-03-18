import { Router } from 'express';
import authController from '../controller/authController.js'

const router = Router();

router.post('/', authController.login);

export default router;