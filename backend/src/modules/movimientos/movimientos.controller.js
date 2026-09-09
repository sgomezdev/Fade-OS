import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./movimientos.service.js";
import {
  crearMovimientoSchema,
  actualizarMovimientoSchema,
  listarMovimientosSchema,
} from "./movimientos.validation.js";

// GET /api/movimientos
export const listar = asyncHandler(async (req, res) => {
  const filtros = listarMovimientosSchema.parse(req.query);
  const data = await service.listarMovimientos(filtros);
  res.json({ ok: true, total: data.length, data });
});

// GET /api/movimientos/:id
export const obtener = asyncHandler(async (req, res) => {
  const data = await service.obtenerMovimiento(Number(req.params.id));
  res.json({ ok: true, data });
});

// POST /api/movimientos
export const crear = asyncHandler(async (req, res) => {
  const datos = crearMovimientoSchema.parse(req.body);
  const data = await service.crearMovimiento(datos);
  res.status(201).json({ ok: true, data });
});

// PUT /api/movimientos/:id
export const actualizar = asyncHandler(async (req, res) => {
  const datos = actualizarMovimientoSchema.parse(req.body);
  const data = await service.actualizarMovimiento(Number(req.params.id), datos);
  res.json({ ok: true, data });
});

// DELETE /api/movimientos/:id
export const eliminar = asyncHandler(async (req, res) => {
  const data = await service.eliminarMovimiento(Number(req.params.id));
  res.json({ ok: true, mensaje: "Movimiento eliminado", data });
});

// GET /api/movimientos/resumen/dia?fecha=YYYY-MM-DD
export const resumenDia = asyncHandler(async (req, res) => {
  const fecha = req.query.fecha ? new Date(req.query.fecha) : new Date();
  const data = await service.resumenDelDia(fecha);
  res.json({ ok: true, data });
});

// GET /api/movimientos/resumen/calendario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
export const resumenCalendario = asyncHandler(async (req, res) => {
  const { desde, hasta, barberoId } = req.query;
  if (!desde || !hasta) {
    return res.status(400).json({
      ok: false,
      error: "Se requieren los parámetros 'desde' y 'hasta' (YYYY-MM-DD)",
    });
  }
  const data = await service.resumenPorDia({ desde, hasta, barberoId });
  res.json({ ok: true, data });
});
