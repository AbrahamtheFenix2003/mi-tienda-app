import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mainApiRouter from './api/index.js';

// Obtener __dirname equivalente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar la aplicación de Express
const app: Application = express();

// Configuración de CORS dinámica basada en variables de entorno
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);

    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parsea JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsea URL-encoded bodies

// --- SERVIR ARCHIVOS ESTÁTICOS ---
// Servir archivos desde la carpeta 'uploads' bajo la ruta '/uploads'
const uploadsPath = path.resolve(__dirname, '..', 'uploads'); // Va un nivel arriba desde src

// Middleware para servir archivos estáticos
app.use('/uploads', express.static(uploadsPath));
// ------------------------------------

// Ruta de prueba para verificar que la API está viva
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API corriendo' });
});

// Montar el enrutador principal de la API bajo /api/v1
app.use('/api/v1', mainApiRouter);

export default app;
