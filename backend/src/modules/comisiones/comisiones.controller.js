import dayjs from "dayjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./comisiones.service.js";

// GET /api/comisiones?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Si no se pasan fechas, usa el mes actual.
export const calcular = asyncHandler(async (req, res) => {
  const desde = req.query.desde || dayjs().startOf("month").format("YYYY-MM-DD");
  const hasta = req.query.hasta || dayjs().endOf("month").format("YYYY-MM-DD");

  const data = await service.calcularComisiones({ desde, hasta });
  res.json({ ok: true, desde, hasta, data });
});