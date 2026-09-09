import axios from "axios";

// Instancia de axios apuntando a nuestro backend.
export const api = axios.create({
  baseURL: "/api",
});

export async function getResumenDia(fecha) {
  const params = fecha ? { fecha } : {};
  const { data } = await api.get("/movimientos/resumen/dia", { params });
  return data.data;
}

export async function getMovimientos(filtros = {}) {
  const { data } = await api.get("/movimientos", { params: filtros });
  return data.data;
}

export async function crearMovimiento(movimiento) {
  const { data } = await api.post("/movimientos", movimiento);
  return data.data;
}

// Actualiza un movimiento existente (PUT).
export async function actualizarMovimiento(id, cambios) {
  const { data } = await api.put(`/movimientos/${id}`, cambios);
  return data.data;
}

// Elimina un movimiento (DELETE).
export async function eliminarMovimiento(id) {
  const { data } = await api.delete(`/movimientos/${id}`);
  return data.data;
}

export async function getBarberos() {
  const { data } = await api.get("/barberos");
  return data.data;
}

export async function crearBarbero(datos) {
  const { data } = await api.post("/barberos", datos);
  return data.data;
}


export async function getComisiones(desde, hasta) {
  const { data } = await api.get("/comisiones", { params: { desde, hasta } });
  return data.data;
}

export async function getResumenCalendario(desde, hasta, barberoId) {
  const params = { desde, hasta };
  if (barberoId) params.barberoId = barberoId;
  const { data } = await api.get("/movimientos/resumen/calendario", { params });
  return data.data;
}
// --- Caja (apertura y cierre) ---
export async function getCaja(fecha) {
  const params = fecha ? { fecha } : {};
  const { data } = await api.get("/caja/actual", { params });
  return data.data;
}

export async function abrirCaja(montoInicial, fecha) {
  const { data } = await api.post("/caja/abrir", { montoInicial, fecha });
  return data.data;
}

export async function cerrarCaja(sesionId, cierreReal, notas) {
  const { data } = await api.post("/caja/cerrar", { sesionId, cierreReal, notas });
  return data.data;
}
export async function getProductos() {
  const { data } = await api.get("/inventario");
  return data.data;
}
export async function crearProducto(datos) {
  const { data } = await api.post("/inventario", datos);
  return data.data;
}
export async function actualizarProducto(id, cambios) {
  const { data } = await api.put(`/inventario/${id}`, cambios);
  return data.data;
}
export async function ajustarStock(id, delta) {
  const { data } = await api.post(`/inventario/${id}/ajustar-stock`, { delta });
  return data.data;
}
export async function reponerProducto(id, cantidad, totalPagado, metodoPago) {
  const { data } = await api.post(`/inventario/${id}/reponer`, { cantidad, totalPagado, metodoPago });
  return data.data;
}
export async function eliminarProducto(id) {
  const { data } = await api.delete(`/inventario/${id}`);
  return data.data;
}
export async function getNegocio() {
  const { data } = await api.get("/negocio");
  return data.data;
}
export async function actualizarNegocio(datos) {
  const { data } = await api.put("/negocio", datos);
  return data.data;
}
export async function subirLogoNegocio(file) {
  const formData = new FormData();
  formData.append("logo", file);
  const { data } = await api.post("/negocio/logo", formData);
  return data.data;
}
const ORIGEN_BACKEND = api.defaults.baseURL.replace(/\/api\/?$/, "");

export function urlArchivo(ruta) {
  if (!ruta) return ruta;
  if (ruta.startsWith("http://") || ruta.startsWith("https://") || ruta.startsWith("blob:")) return ruta;
  if (ruta.startsWith("/uploads/")) return `${ORIGEN_BACKEND}${ruta}`;
  return ruta;
}
export async function getGastosFijos() {
  const { data } = await api.get("/gastos-fijos");
  return data.data;
}
export async function crearGastoFijo(datos) {
  const { data } = await api.post("/gastos-fijos", datos);
  return data.data;
}
export async function actualizarGastoFijo(id, cambios) {
  const { data } = await api.put(`/gastos-fijos/${id}`, cambios);
  return data.data;
}
export async function eliminarGastoFijo(id) {
  const { data } = await api.delete(`/gastos-fijos/${id}`);
  return data.data;
}
export async function marcarGastoPagado(id, metodoPago) {
  const { data } = await api.post(`/gastos-fijos/${id}/pagar`, { metodoPago });
  return data.data;
}
export async function getDeudaPendiente(barberoId) {
  const { data } = await api.get(`/deudas-barbero/${barberoId}`);
  return data.data;
}
export async function registrarRetiroBarbero(datos) {
  const { data } = await api.post("/deudas-barbero/retiro", datos);
  return data.data;
}
export async function registrarConsumoBarbero(datos) {
  const { data } = await api.post("/deudas-barbero/consumo", datos);
  return data.data;
}
export async function saldarDeudasBarbero(barberoId) {
  const { data } = await api.post(`/deudas-barbero/${barberoId}/saldar`);
  return data.data;
}
