import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./barberos.service.js";
import { crearBarberoSchema } from "./barberos.validation.js";

// GET /api/barberos
export const listar = asyncHandler(async (req, res) => {
  const data = await service.listarBarberos();
  res.json({ ok: true, total: data.length, data });
});

// POST /api/barberos
export const crear = asyncHandler(async (req, res) => {
  const datos = crearBarberoSchema.parse(req.body);
  const barbero = await service.crearBarbero(datos);
  res.status(201).json({ ok: true, data: barbero });
});