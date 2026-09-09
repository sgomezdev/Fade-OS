// Envuelve un controlador async y redirige cualquier error al errorHandler.
// Evita escribir try/catch en cada función del controlador.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
