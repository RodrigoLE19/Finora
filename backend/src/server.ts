import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes'
import { testDatabaseConecction } from './config/database';
import authRoutes from './routes/auth.routes'
import movementRoutes from './routes/movement.routes';
import categoryRoutes from './routes/category.routes';
import budgetRoutes from './routes/budget.routes'
import recorringExpenseRoutes from './routes/recurring-expense.routes';
import dashboardRoutes from './routes/dashboard.routes';

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
app.use('/api/presupuestos', budgetRoutes);
app.use('/api/gastos-recurrentes', recorringExpenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});