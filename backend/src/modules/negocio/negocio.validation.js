import { z } from "zod";

export const actualizarNegocioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  logo: z.string().trim().optional().nullable(),
  colorAcento: z.string().trim().optional().nullable(),
  mostrarGastosFijos: z.boolean().optional(),
});