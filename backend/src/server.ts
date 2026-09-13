import express from 'express';

const app = express();

const PORT = 3000;

app. use(express.json());

app.get('/', (_req, res) => {
    res.json({
        message: 'API de finora funcionando correctamente'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});