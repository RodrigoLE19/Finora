import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { getStatistics } from "../controllers/statistics.controller";


const router = Router();

router.get('/', authenticateToken, getStatistics);

export default router;