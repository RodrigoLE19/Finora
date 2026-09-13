import express from 'express';
import cors from 'cors';

const app = express();

const PORT = 3000;

app.use(cors({
    origin: `http://localhost:4200`
}));

app. use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'API de finora funcionando correctamente'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});