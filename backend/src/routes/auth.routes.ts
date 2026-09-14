import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middlewares";

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticateToken, (req, res)=> {
    return res.status(200).json({
        message: 'Token valido',
        usuario: res.locals.usuario
    });
});

export default router;