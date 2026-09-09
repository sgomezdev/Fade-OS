import { z } from "zod";

export const crearGastoFijoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  monto: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  frecuenciaDias: z.coerce.number().int().positive("La frecuencia debe ser mayor a 0"),
  color: z.string().trim().optional().nullable(),
});

export const actualizarGastoFijoSchema = crearGastoFijoSchema.partial();

export const marcarPagadoSchema = z.object({
  metodoPago: z.enum(["EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA", "OTRO"]),
});