import { prisma } from "../../config/db.js";

// Configuración del negocio: siempre es UNA sola fila (id fijo = 1).
// Si todavía no existe, la crea con valores por defecto (útil en instalaciones nuevas).
export async function obtener() {
  const existente = await prisma.negocio.findUnique({ where: { id: 1 } });
  if (existente) return existente;
  return prisma.negocio.create({ data: { id: 1, nombre: "Mi Barbería" } });
}

export async function actualizar(datos) {
  return prisma.negocio.upsert({
    where: { id: 1 },
    update: datos,
    create: { id: 1, ...datos },
  });
}