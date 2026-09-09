import { z } from "zod";

const tipos = ["INGRESO", "EGRESO"];
const metodosPago = ["EFECTIVO", "TARJETA", "NEQUI", "TRANSFERENCIA", "OTRO"];

// Validación para crear un movimiento
export const crearMovimientoSchema = z.object({
  tipo: z.enum(tipos, {
    errorMap: () => ({ message: "El tipo debe ser INGRESO o EGRESO" }),
  }),
  monto: z
    .number({ invalid_type_error: "El monto debe ser un número" })
    .positive("El monto debe ser mayor a 0"),
  concepto: z
    .string()
    .trim()
    .min(1, "El concepto es obligatorio")
    .max(200, "El concepto es demasiado largo"),
  metodoPago: z.enum(metodosPago).default("EFECTIVO"),
  tipoItem: z.enum(["SERVICIO", "BEBIDA", "CAPILAR", "EGRESO", "OTRO", "COMPRA_INVENTARIO", "GASTO_FIJO", "PROPINA", "RETIRO_BARBERO"]).optional(),
  fecha: z.coerce.date().optional(),
  categoriaId: z.number().int().positive().nullish(),
  barberoId: z.number().int().positive().nullish(),
  sesionId: z.number().int().positive().nullish(),
  productoId: z.number().int().positive().nullish(),
  cantidad: z.number().int().positive().nullish(),
});

// Validación para actualizar (todos los campos opcionales)
export const actualizarMovimientoSchema = crearMovimientoSchema.partial();

// Validación de filtros para el listado (query params)
export const listarMovimientosSchema = z.object({
  tipo: z.enum(tipos).optional(),
  metodoPago: z.enum(metodosPago).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  barberoId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
});