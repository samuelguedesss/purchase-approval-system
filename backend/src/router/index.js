import { Router } from 'express';
import AuthRoutes from './AuthRouter.js'
import purchaseResquestsRouter from './purchaseRequestsRouter.js'
import departmentRouter from './departmentRouter.js'
import userRouter from './userRouter.js'
import authMiddleware from '../middlewares/authMiddleware.js'


const router = Router();

router.use('/login',  AuthRoutes);
router.use('/purchase-requests', authMiddleware, purchaseResquestsRouter);
router.use('/departments', authMiddleware, departmentRouter);
router.use('/users', authMiddleware, userRouter);

export default router;
