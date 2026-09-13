import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes'
import { testDatabaseConecction } from './config/database';


const app = express();

const PORT = 3000;

testDatabaseConecction();

app.use(cors({
    origin: `http://localhost:4200`
}));

app.use(express.json());

app.use('/api', healthRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});