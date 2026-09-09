import { PrismaClient } from "@prisma/client";

// Cliente único de Prisma para toda la app (evita múltiples conexiones)
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Cierre limpio de la conexión al apagar el servidor
export async function disconnectDb() {
  await prisma.$disconnect();
}
