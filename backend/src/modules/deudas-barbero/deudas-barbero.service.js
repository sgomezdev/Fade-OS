import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

// Cuánto debe cada barbero ahora mismo (para mostrarlo en cualquier momento, no solo al pagar).
export async function listarPendientesPorBarbero() {
  const deudas = await prisma.deudaBarbero.findMany({ where: { saldado: false } });
  const mapa = {};
  for (const d of deudas) mapa[d.barberoId] = (mapa[d.barberoId] || 0) + d.monto;
  return mapa;
}

// Detalle de lo que debe un barbero puntual (para mostrarle el desglose si hace falta).
export async function listarDetalle(barberoId) {
  return prisma.deudaBarbero.findMany({
    where: { barberoId: Number(barberoId), saldado: false },
    orderBy: { creadoEn: "desc" },
    include: { producto: { select: { nombre: true } } },
  });
}

// Retiro de caja: sale efectivo real HOY (por eso también crea un Movimiento, para que
// cuadre la Caja), y además queda como deuda pendiente para descontarse del próximo pago.
export async function registrarRetiro({ barberoId, monto, concepto, metodoPago }) {
  const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
  if (!barbero) throw new ApiError(404, "Barbero no encontrado.");

  return prisma.$transaction(async (tx) => {
    await tx.movimiento.create({
      data: {
        tipo: "EGRESO",
        monto,
        concepto: `${concepto} · ${barbero.nombre}`,
        metodoPago,
        tipoItem: "RETIRO_BARBERO",
        barberoId,
      },
    });
    return tx.deudaBarbero.create({ data: { barberoId, monto, concepto, saldado: false } });
  });
}

// Consumo de producto a precio de empleado: NO sale efectivo de caja (no paga en el momento),
// pero SÍ sale el producto del inventario, y queda como deuda pendiente.
export async function registrarConsumo({ barberoId, productoId, cantidad, monto }) {
  const [barbero, producto] = await Promise.all([
    prisma.barbero.findUnique({ where: { id: barberoId } }),
    prisma.producto.findUnique({ where: { id: productoId } }),
  ]);
  if (!barbero) throw new ApiError(404, "Barbero no encontrado.");
  if (!producto) throw new ApiError(404, "Producto no encontrado.");
  if (producto.stock < cantidad) throw new ApiError(400, `Solo quedan ${producto.stock} de "${producto.nombre}".`);

  return prisma.$transaction(async (tx) => {
    await tx.producto.update({ where: { id: productoId }, data: { stock: producto.stock - cantidad } });
    return tx.deudaBarbero.create({
      data: { barberoId, productoId, cantidad, monto, concepto: `${cantidad} x ${producto.nombre}`, saldado: false },
    });
  });
}

// Marca como saldadas todas las deudas pendientes de un barbero (se usa al pagarle la comisión).
export async function saldarDeudas(barberoId) {
  const { count } = await prisma.deudaBarbero.updateMany({
    where: { barberoId: Number(barberoId), saldado: false },
    data: { saldado: true },
  });
  return { saldadas: count };
}