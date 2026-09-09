import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../middleware/errorHandler.js";
import * as service from "./negocio.service.js";
import { actualizarNegocioSchema } from "./negocio.validation.js";

export const obtener = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.obtener() });
});

export const actualizar = asyncHandler(async (req, res) => {
  const datos = actualizarNegocioSchema.parse(req.body);
  res.json({ ok: true, data: await service.actualizar(datos) });
});

// Recibe el archivo (ya guardado en disco por multer) y guarda su ruta pública en el negocio.
export const subirLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No se recibió ningún archivo.");
  const rutaPublica = `/uploads/${req.file.filename}`;
  const data = await service.actualizar({ logo: rutaPublica });
  res.json({ ok: true, data });
});