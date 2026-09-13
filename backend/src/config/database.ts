import { Pool } from "pg";
import dotenv from 'dotenv';
import console from "node:console";


dotenv.config();

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export const testDatabaseConecction = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`PostgreSQL conectado correctamente`);
        console.log(`Hora de la base de datos:`, result.rows[0].now);
        
    } catch (error) {
        console.error(`Error al conectar con PostgreSQL:`, error);
        
    }
}