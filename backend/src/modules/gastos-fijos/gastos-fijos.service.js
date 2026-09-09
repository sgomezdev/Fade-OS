import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

export async function listar() {
  return prisma.gastoFijo.findMany({ where: { activo: true }, orderBy: { creadoEn: "asc" } });
}

export async function crear(datos) {
  return prisma.gastoFijo.create({ data: datos });
}

export async function actualizar(id, cambios) {
  const gasto = await prisma.gastoFijo.findUnique({ where: { id: Number(id) } });
  if (!gasto) throw new ApiError(404, "Gasto fijo no encontrado.");
  return prisma.gastoFijo.update({ where: { id: Number(id) }, data: cambios });
}

export async function eliminar(id) {
  const gasto = await prisma.gastoFijo.findUnique({ where: { id: Number(id) } });
  if (!gasto) throw new ApiError(404, "Gasto fijo no encontrado.");
  return prisma.gastoFijo.update({ where: { id: Number(id) }, data: { activo: false } });
}

// Marca el gasto como pagado HOY: crea el egreso real en Movimientos (para que cuadre con
// Caja y la Utilidad Real) y actualiza la fecha del último pago, para recalcular el próximo.
export async function marcarPagado(id, metodoPago) {
  const gasto = await prisma.gastoFijo.findUnique({ where: { id: Number(id) } });
  if (!gasto) throw new ApiError(404, "Gasto fijo no encontrado.");

  return prisma.$transaction(async (tx) => {
    await tx.movimiento.create({
      data: {
        tipo: "EGRESO",
        monto: gasto.monto,
        concepto: gasto.nombre,
        metodoPago,
        tipoItem: "GASTO_FIJO",
      },
    });
    return tx.gastoFijo.update({ where: { id: gasto.id }, data: { ultimoPago: new Date() } });
  });
}