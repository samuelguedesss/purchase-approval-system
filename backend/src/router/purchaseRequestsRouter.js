import { Router } from 'express';
import PurchaseRequestsController from '../controller/purchaseRequestsController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router();

router.post('/', authMiddleware, PurchaseRequestsController.createPurchaseRequests);
router.get('/', authMiddleware, PurchaseRequestsController.getPurchaseRequests);
router.get('/pending', authMiddleware, PurchaseRequestsController.getPendingApprovals);
router.patch('/:id/approve', authMiddleware, PurchaseRequestsController.approvePurchaseRequest);
router.patch('/:id/reject', authMiddleware, PurchaseRequestsController.rejectPurchaseRequest);

export default router
