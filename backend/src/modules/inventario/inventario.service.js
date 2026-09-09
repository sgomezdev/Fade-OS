import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

export async function listar() {
  return prisma.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}

export async function crear(datos) {
  return prisma.producto.create({ data: datos });
}

export async function actualizar(id, cambios) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!producto) throw new ApiError(404, "Producto no encontrado.");
  return prisma.producto.update({ where: { id: Number(id) }, data: cambios });
}

export async function ajustarStock(id, delta) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!producto) throw new ApiError(404, "Producto no encontrado.");
  const nuevoStock = producto.stock + delta;
  if (nuevoStock < 0) throw new ApiError(400, "No hay stock suficiente.");
  return prisma.producto.update({ where: { id: Number(id) }, data: { stock: nuevoStock } });
}

// Registra un pedido nuevo (paca): suma `cantidad` al stock, recalcula el costo unitario
// (total pagado / unidades), Y crea el EGRESO correspondiente en Movimientos — así ese
// gasto sí sale de la caja de la app y el cuadre de efectivo queda exacto.
export async function reponer(id, cantidad, totalPagado, metodoPago) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!producto) throw new ApiError(404, "Producto no encontrado.");

  const costoUnitario = Math.round(totalPagado / cantidad);

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.producto.update({
      where: { id: Number(id) },
      data: { stock: producto.stock + cantidad, costo: costoUnitario },
    });

    await tx.movimiento.create({
      data: {
        tipo: "EGRESO",
        monto: Math.round(totalPagado),
        concepto: `Pedido: ${cantidad} x ${producto.nombre}`,
        metodoPago,
        tipoItem: "COMPRA_INVENTARIO",
        productoId: producto.id,
        cantidad,
      },
    });

    return actualizado;
  });
}

export async function eliminar(id) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!producto) throw new ApiError(404, "Producto no encontrado.");
  return prisma.producto.update({ where: { id: Number(id) }, data: { activo: false } });
}