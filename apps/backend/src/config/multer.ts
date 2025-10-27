// src/config/multer.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurarse de que el directorio 'uploads' exista
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads'); // Va dos niveles arriba desde dist/config
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Directorio donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    // Generar un nombre único: timestamp + extensión original
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp).'));
  }
};

// Crear la instancia de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
  fileFilter: fileFilter
});

export default upload;