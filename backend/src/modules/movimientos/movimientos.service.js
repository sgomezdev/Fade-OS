import dayjs from "dayjs";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

const includeRelaciones = {
  categoria: { select: { id: true, nombre: true, color: true } },
  barbero: { select: { id: true, nombre: true } },
};

export async function listarMovimientos(filtros = {}) {
  const where = {};
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.metodoPago) where.metodoPago = filtros.metodoPago;
  if (filtros.barberoId) where.barberoId = filtros.barberoId;
  if (filtros.categoriaId) where.categoriaId = filtros.categoriaId;
  if (filtros.desde || filtros.hasta) {
    where.fecha = {};
    if (filtros.desde) where.fecha.gte = dayjs(filtros.desde).startOf("day").toDate();
    if (filtros.hasta) where.fecha.lte = dayjs(filtros.hasta).endOf("day").toDate();
  }
  return prisma.movimiento.findMany({ where, include: includeRelaciones, orderBy: { fecha: "desc" } });
}

export async function obtenerMovimiento(id) {
  const movimiento = await prisma.movimiento.findUnique({ where: { id }, include: includeRelaciones });
  if (!movimiento) throw new ApiError(404, "Movimiento no encontrado");
  return movimiento;
}

// Crea un nuevo movimiento. Si es venta de BEBIDA/CAPILAR ligada a inventario, descuenta el
// stock según la CANTIDAD vendida (no siempre 1) y congela el costo unitario de ese momento.
export async function crearMovimiento(datos) {
  if ((datos.tipoItem === "BEBIDA" || datos.tipoItem === "CAPILAR") && datos.productoId) {
    const cantidad = datos.cantidad && datos.cantidad > 0 ? datos.cantidad : 1;
    return prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: Number(datos.productoId) } });
      if (!producto) throw new ApiError(404, "El producto ya no existe en el inventario.");
      if (producto.stock < cantidad) throw new ApiError(400, `Solo quedan ${producto.stock} de "${producto.nombre}".`);

      await tx.producto.update({ where: { id: producto.id }, data: { stock: producto.stock - cantidad } });

      return tx.movimiento.create({
        data: { ...datos, cantidad, costoUnitario: producto.costo },
        include: includeRelaciones,
      });
    });
  }

  return prisma.movimiento.create({ data: datos, include: includeRelaciones });
}

export async function actualizarMovimiento(id, datos) {
  await obtenerMovimiento(id);
  return prisma.movimiento.update({ where: { id }, data: datos, include: includeRelaciones });
}

export async function eliminarMovimiento(id) {
  const movimiento = await obtenerMovimiento(id);

  if (movimiento.productoId) {
    return prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: movimiento.productoId } });
      if (producto) {
        const cantidad = movimiento.cantidad || 1;
        if (movimiento.tipoItem === "COMPRA_INVENTARIO") {
          const nuevoStock = producto.stock - cantidad;
          if (nuevoStock < 0) {
            throw new ApiError(400, "No se puede eliminar esta compra: ya se vendieron unidades de ese lote.");
          }
          await tx.producto.update({ where: { id: producto.id }, data: { stock: nuevoStock } });
        } else {
          await tx.producto.update({ where: { id: producto.id }, data: { stock: producto.stock + cantidad } });
        }
      }
      await tx.movimiento.delete({ where: { id } });
      return { id };
    });
  }

  await prisma.movimiento.delete({ where: { id } });
  return { id };
}

export async function resumenPorDia({ desde, hasta, barberoId }) {
  const inicio = dayjs(desde).startOf("day").toDate();
  const fin = dayjs(hasta).endOf("day").toDate();
  const where = { fecha: { gte: inicio, lte: fin } };
  if (barberoId) where.barberoId = Number(barberoId);
  const movimientos = await prisma.movimiento.findMany({ where, select: { tipo: true, monto: true, fecha: true } });
  const mapa = new Map();
  for (const mov of movimientos) {
    const clave = dayjs(mov.fecha).format("YYYY-MM-DD");
    if (!mapa.has(clave)) mapa.set(clave, { fecha: clave, ingresos: 0, egresos: 0, balance: 0, cantidad: 0 });
    const dia = mapa.get(clave);
    if (mov.tipo === "INGRESO") dia.ingresos += mov.monto;
    else dia.egresos += mov.monto;
    dia.balance = dia.ingresos - dia.egresos;
    dia.cantidad += 1;
  }
  return Array.from(mapa.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function resumenDelDia(fecha = new Date()) {
  const inicio = dayjs(fecha).startOf("day").toDate();
  const fin = dayjs(fecha).endOf("day").toDate();
  const movimientos = await prisma.movimiento.findMany({ where: { fecha: { gte: inicio, lte: fin } }, include: includeRelaciones, orderBy: { fecha: "desc" } });
  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((sum, m) => sum + m.monto, 0);
  const egresos = movimientos.filter((m) => m.tipo === "EGRESO").reduce((sum, m) => sum + m.monto, 0);
  const porMetodo = {};
  for (const m of movimientos.filter((x) => x.tipo === "INGRESO")) porMetodo[m.metodoPago] = (porMetodo[m.metodoPago] || 0) + m.monto;
  return { fecha: dayjs(fecha).format("YYYY-MM-DD"), ingresos, egresos, balance: ingresos - egresos, cantidadMovimientos: movimientos.length, porMetodo, movimientos };
}