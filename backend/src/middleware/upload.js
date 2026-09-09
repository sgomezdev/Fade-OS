// Middleware reutilizable para subir imágenes (logo del negocio, fotos de productos, etc.).
// Guarda el archivo en backend/uploads/ con un nombre único, y lo deja listo para servirse
// como archivo estático desde /uploads/nombre-del-archivo.ext
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

// Crea la carpeta uploads/ si todavía no existe
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

function filtroImagen(req, file, cb) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("El archivo debe ser una imagen."));
}

export const upload = multer({
  storage,
  fileFilter: filtroImagen,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});