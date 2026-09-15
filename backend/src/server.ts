import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes'
import { testDatabaseConecction } from './config/database';
import authRoutes from './routes/auth.routes'
import movementRoutes from './routes/movement.routes';
import categoryRoutes from './routes/category.routes';

const app = express();

const PORT = 3000;

testDatabaseConecction();

app.use(cors({
    origin: `http://localhost:4200`
}));

app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movimientos',movementRoutes);
app.use('/api/categorias', categoryRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});