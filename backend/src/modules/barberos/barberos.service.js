import { prisma } from "../../config/db.js";

export async function listarBarberos() {
  return prisma.barbero.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function crearBarbero(datos) {
  return prisma.barbero.create({
    data: {
      nombre: datos.nombre,
      telefono: datos.telefono || null,
      comisionPct: datos.comisionPct,
      activo: true,
    },
  });
}