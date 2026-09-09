import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./deudas-barbero.service.js";
import { crearRetiroSchema, crearConsumoSchema } from "./deudas-barbero.validation.js";

export const listarPendientes = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.listarPendientesPorBarbero() });
});

export const listarDetalle = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.listarDetalle(req.params.barberoId) });
});

export const registrarRetiro = asyncHandler(async (req, res) => {
  const datos = crearRetiroSchema.parse(req.body);
  res.status(201).json({ ok: true, data: await service.registrarRetiro(datos) });
});

export const registrarConsumo = asyncHandler(async (req, res) => {
  const datos = crearConsumoSchema.parse(req.body);
  res.status(201).json({ ok: true, data: await service.registrarConsumo(datos) });
});

export const saldar = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.saldarDeudas(req.params.barberoId) });
});