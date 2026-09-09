import { ZodError } from "zod";

// Clase de error propia para lanzar errores controlados con un status HTTP
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Middleware para rutas no encontradas (404)
export function notFound(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Middleware central de errores. Debe ir al final de la cadena de middlewares.
export function errorHandler(err, req, res, _next) {
  // Errores de validación de Zod → 400 con detalle de campos
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "Datos inválidos",
      detalles: err.errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error("❌ Error no controlado:", err);
  }

  res.status(statusCode).json({
    ok: false,
    error: err.message || "Error interno del servidor",
  });
}
