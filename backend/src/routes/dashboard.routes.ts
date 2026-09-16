import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { getSummary } from "../controllers/dashboard.controller";



const router = Router();

router.get('/resumen', authenticateToken, getSummary);

export default router;