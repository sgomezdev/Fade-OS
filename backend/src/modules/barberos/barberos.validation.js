import { z } from "zod";

export const crearBarberoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  telefono: z.string().trim().max(20, "Máximo 20 caracteres").optional().nullable(),
  comisionPct: z.coerce
    .number()
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede pasar de 100%"),
});