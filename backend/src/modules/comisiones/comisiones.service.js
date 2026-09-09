import dayjs from "dayjs";
import { prisma } from "../../config/db.js";
import { listarPendientesPorBarbero } from "../deudas-barbero/deudas-barbero.service.js";

const COMISION_CAPILAR_PCT = 20;

// Reglas:
//  - Servicios: el barbero gana su comisionPct.
//  - Capilares: el barbero gana el 20%.
//  - Propinas: el barbero gana el 100%.
//  - Bebidas: son de la barbería, no generan comisión.
//  - Se le resta lo que deba (retiros de caja o consumos de producto sin pagar).
export async function calcularComisiones({ desde, hasta }) {
  const inicio = dayjs(desde).startOf("day").toDate();
  const fin = dayjs(hasta).endOf("day").toDate();

  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  const movimientos = await prisma.movimiento.findMany({
    where: { tipo: "INGRESO", barberoId: { not: null }, fecha: { gte: inicio, lte: fin } },
    select: { barberoId: true, monto: true, tipoItem: true },
  });

  const deudasPorBarbero = await listarPendientesPorBarbero();

  return barberos.map((b) => {
    const suyos = movimientos.filter((m) => m.barberoId === b.id);

    const totalServicios = suyos.filter((m) => m.tipoItem === "SERVICIO").reduce((sum, m) => sum + m.monto, 0);
    const totalCapilares = suyos.filter((m) => m.tipoItem === "CAPILAR").reduce((sum, m) => sum + m.monto, 0);
    const totalPropinas = suyos.filter((m) => m.tipoItem === "PROPINA").reduce((sum, m) => sum + m.monto, 0);

    const comisionServicios = totalServicios * (b.comisionPct / 100);
    const comisionCapilares = totalCapilares * (COMISION_CAPILAR_PCT / 100);
    const comisionPropinas = totalPropinas;

    const comisionTotal = comisionServicios + comisionCapilares + comisionPropinas;
    const deudaPendiente = deudasPorBarbero[b.id] || 0;
    const montoNeto = Math.max(0, comisionTotal - deudaPendiente);

    return {
      barberoId: b.id,
      nombre: b.nombre,
      comisionPct: b.comisionPct,
      totalServicios,
      totalCapilares,
      totalPropinas,
      totalProducido: totalServicios + totalCapilares,
      comisionServicios,
      comisionCapilares,
      comisionPropinas,
      comisionTotal,
      deudaPendiente,
      montoNeto,
    };
  });
}