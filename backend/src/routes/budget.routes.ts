import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { create, getAll, update, remove } from "../controllers/budget.controller";

const router = Router();

router.post('/', authenticateToken, create);
router.get('/', authenticateToken, getAll);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

export default router;