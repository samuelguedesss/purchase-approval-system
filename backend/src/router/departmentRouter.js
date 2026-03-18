import { Router } from 'express';
import DepartmentController from '../controller/departmentController.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import authorizeRoles from '../middlewares/roleMiddleware.js'

const router = Router();

router.get('/', authMiddleware, DepartmentController.getDepartments);
router.post('/', authMiddleware, authorizeRoles('GENERAL_MANAGER'), DepartmentController.createDepartment);

export default router
