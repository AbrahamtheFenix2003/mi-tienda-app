import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import mainApiRouter from './api/index.js';

// Inicializar la aplicación de Express
const app: Application = express();

// Middlewares base
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parsea JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsea URL-encoded bodies

// --- SERVIR ARCHIVOS ESTÁTICOS ---
// Servir archivos desde la carpeta 'uploads' bajo la ruta '/uploads'
const uploadsPath = path.resolve(__dirname, '..', '..', 'uploads'); // Asegura ruta correcta en dist
app.use('/uploads', express.static(uploadsPath));
// ------------------------------------

// Ruta de prueba para verificar que la API está viva
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API corriendo' });
});

// Montar el enrutador principal de la API bajo /api/v1
app.use('/api/v1', mainApiRouter);

export default app;
