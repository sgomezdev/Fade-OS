import dayjs from "dayjs";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

// Suma el efectivo del día: solo cuenta movimientos con metodoPago EFECTIVO.
async function efectivoDelDia(fecha) {
  const inicio = dayjs(fecha).startOf("day").toDate();
  const fin = dayjs(fecha).endOf("day").toDate();

  const movs = await prisma.movimiento.findMany({
    where: { fecha: { gte: inicio, lte: fin }, metodoPago: "EFECTIVO" },
    select: { tipo: true, monto: true },
  });

  const ingresos = movs.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + m.monto, 0);
  const egresos = movs.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + m.monto, 0);
  return { ingresos, egresos };
}

// Devuelve la sesión de caja de un día (o null) con los cálculos de efectivo.
export async function obtenerSesion(fecha) {
  const inicio = dayjs(fecha).startOf("day").toDate();
  const fin = dayjs(fecha).endOf("day").toDate();

  const sesion = await prisma.sesionCaja.findFirst({
    where: { fecha: { gte: inicio, lte: fin } },
    orderBy: { abiertaEn: "desc" },
  });

  const { ingresos, egresos } = await efectivoDelDia(fecha);
  const cierreEsperado = sesion ? sesion.montoInicial + ingresos - egresos : null;

  return { sesion, efectivoIngresos: ingresos, efectivoEgresos: egresos, cierreEsperado };
}

// Abre la caja de un día con un fondo inicial.
export async function abrirCaja({ fecha, montoInicial }) {
  const f = fecha ? new Date(fecha) : new Date();
  const inicio = dayjs(f).startOf("day").toDate();
  const fin = dayjs(f).endOf("day").toDate();

  const existente = await prisma.sesionCaja.findFirst({ where: { fecha: { gte: inicio, lte: fin } } });
  if (existente) throw new ApiError(400, "Ya existe una caja para este día.");

  return prisma.sesionCaja.create({
    data: {
      fecha: f,
      montoInicial: Number(montoInicial) || 0,
      estado: "ABIERTA",
      abiertaEn: new Date(),
    },
  });
}

// Cierra la caja: calcula el esperado, guarda el real y la diferencia.
export async function cerrarCaja({ sesionId, cierreReal, notas }) {
  const sesion = await prisma.sesionCaja.findUnique({ where: { id: Number(sesionId) } });
  if (!sesion) throw new ApiError(404, "Sesión de caja no encontrada.");
  if (sesion.estado === "CERRADA") throw new ApiError(400, "La caja ya está cerrada.");

  const { ingresos, egresos } = await efectivoDelDia(sesion.fecha);
  const esperado = sesion.montoInicial + ingresos - egresos;
  const real = Number(cierreReal) || 0;

  return prisma.sesionCaja.update({
    where: { id: sesion.id },
    data: {
      cierreEsperado: esperado,
      cierreReal: real,
      diferencia: real - esperado,
      estado: "CERRADA",
      cerradaEn: new Date(),
      notas: notas || null,
    },
  });
}