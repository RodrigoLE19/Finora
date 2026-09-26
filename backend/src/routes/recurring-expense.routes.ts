import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { create, getAll, update, remove, registerPayment } from "../controllers/recurring-expense.controller";



const router = Router();

router.post('/', authenticateToken, create);
router.get('/', authenticateToken, getAll);
router.post(
    '/:id/registrar-pago',
    authenticateToken,
    registerPayment
);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

export default router;