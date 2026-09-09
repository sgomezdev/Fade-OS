import { z } from "zod";

export const crearRetiroSchema = z.object({
  barberoId: z.coerce.number().int().positive(),
  monto: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  concepto: z.string().trim().min(1).max(120).default("Retiro de caja"),
  metodoPago: z.enum(["EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA", "OTRO"]),
});

export const crearConsumoSchema = z.object({
  barberoId: z.coerce.number().int().positive(),
  productoId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive().default(1),
  monto: z.coerce.number().int().min(0, "El monto no puede ser negativo"),
});