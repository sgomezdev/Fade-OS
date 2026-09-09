export function formatoPesos(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor ?? 0);
}

// Formatea una fecha ISO a algo legible: "28 jul, 2:30 p. m."
export function formatoFechaHora(fechaIso) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(fechaIso));
}

// Formato compacto para espacios angostos (ej. tarjetas en celular): $1.2M, $450K, $8.500.
export function formatoCompacto(v) {
  const valor = v ?? 0;
  const signo = valor < 0 ? "-" : "";
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) {
    const millones = abs / 1_000_000;
    return `${signo}$${millones.toFixed(millones >= 10 ? 0 : 1)}M`;
  }
  if (abs >= 100_000) {
    return `${signo}$${Math.round(abs / 1000)}K`;
  }
  return formatoPesos(valor);
}