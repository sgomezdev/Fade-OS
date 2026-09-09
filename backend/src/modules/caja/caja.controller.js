import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./caja.service.js";

// GET /api/caja/actual?fecha=
export const actual = asyncHandler(async (req, res) => {
  const fecha = req.query.fecha ? new Date(req.query.fecha) : new Date();
  const data = await service.obtenerSesion(fecha);
  res.json({ ok: true, data });
});

// POST /api/caja/abrir { montoInicial, fecha? }
export const abrir = asyncHandler(async (req, res) => {
  const { fecha, montoInicial } = req.body;
  const data = await service.abrirCaja({ fecha, montoInicial });
  res.status(201).json({ ok: true, data });
});

// POST /api/caja/cerrar { sesionId, cierreReal, notas? }
export const cerrar = asyncHandler(async (req, res) => {
  const { sesionId, cierreReal, notas } = req.body;
  const data = await service.cerrarCaja({ sesionId, cierreReal, notas });
  res.json({ ok: true, data });
});