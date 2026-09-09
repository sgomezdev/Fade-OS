import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./inventario.service.js";
import { crearProductoSchema, actualizarProductoSchema, ajustarStockSchema, reponerSchema } from "./inventario.validation.js";

export const listar = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.listar() });
});

export const crear = asyncHandler(async (req, res) => {
  const datos = crearProductoSchema.parse(req.body);
  res.status(201).json({ ok: true, data: await service.crear(datos) });
});

export const actualizar = asyncHandler(async (req, res) => {
  const cambios = actualizarProductoSchema.parse(req.body);
  res.json({ ok: true, data: await service.actualizar(req.params.id, cambios) });
});

export const ajustarStock = asyncHandler(async (req, res) => {
  const { delta } = ajustarStockSchema.parse(req.body);
  res.json({ ok: true, data: await service.ajustarStock(req.params.id, delta) });
});

export const reponer = asyncHandler(async (req, res) => {
  const { cantidad, totalPagado, metodoPago } = reponerSchema.parse(req.body);
  res.json({ ok: true, data: await service.reponer(req.params.id, cantidad, totalPagado, metodoPago) });
});

export const eliminar = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await service.eliminar(req.params.id) });
});