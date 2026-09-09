import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./gastos-fijos.service.js";
import { crearGastoFijoSchema, actualizarGastoFijoSchema, marcarPagadoSchema } from "./gastos-fijos.validation.js";

export const listar = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.listar() });
});

export const crear = asyncHandler(async (req, res) => {
  const datos = crearGastoFijoSchema.parse(req.body);
  res.status(201).json({ ok: true, data: await service.crear(datos) });
});

export const actualizar = asyncHandler(async (req, res) => {
  const cambios = actualizarGastoFijoSchema.parse(req.body);
  res.json({ ok: true, data: await service.actualizar(req.params.id, cambios) });
});

export const eliminar = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.eliminar(req.params.id) });
});

export const marcarPagado = asyncHandler(async (req, res) => {
  const { metodoPago } = marcarPagadoSchema.parse(req.body);
  res.json({ ok: true, data: await service.marcarPagado(req.params.id, metodoPago) });
});