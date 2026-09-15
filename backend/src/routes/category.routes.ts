import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { getAllCategories } from "../controllers/category.controller";



const router = Router();

router.get('/', authenticateToken, getAllCategories);

export default router;