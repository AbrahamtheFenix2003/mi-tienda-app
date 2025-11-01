import 'dotenv/config'; // Carga las variables de entorno
import app from './app.js';

// Leer el puerto desde las variables de entorno, con un fallback
const PORT = process.env.PORT || 8080;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`[SERVER] Servidor corriendo en http://localhost:${PORT}`);
});
