import { Router } from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middlewares";
import { rateLimit } from 'express-rate-limit';

const router = Router();
const limiteRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message:
      'Has realizado demasiadas solicitudes. Inténtalo nuevamente en 15 minutos.'
  }
});

const limiteRestablecimiento = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message:
      'Has realizado demasiados intentos. Inténtalo nuevamente en 15 minutos.'
  }
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', limiteRecuperacion, forgotPassword);
router.post('/reset-password', limiteRestablecimiento, resetPassword);

router.get('/me', authenticateToken, (req, res)=> {
    return res.status(200).json({
        message: 'Token valido',
        usuario: res.locals.usuario
    });
});

export default router;