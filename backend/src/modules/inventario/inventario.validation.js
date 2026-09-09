import { z } from "zod";

export const crearProductoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  categoria: z.enum(["BEBIDA", "CAPILAR"]).default("BEBIDA"),
  stock: z.coerce.number().int().min(0).default(0),
  costo: z.coerce.number().min(0),
  precioVenta: z.coerce.number().min(0),
  stockMinimo: z.coerce.number().int().min(0).default(2),
  imagen: z.string().trim().optional().nullable(),
  color: z.string().trim().min(1).optional().nullable(),
});

export const actualizarProductoSchema = crearProductoSchema.partial();

export const ajustarStockSchema = z.object({
  delta: z.coerce.number().int().refine((v) => v !== 0, "El ajuste no puede ser 0"),
});

export const reponerSchema = z.object({
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  totalPagado: z.coerce.number().min(0, "El total pagado no puede ser negativo"),
  metodoPago: z.enum(["EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA", "OTRO"]),
});