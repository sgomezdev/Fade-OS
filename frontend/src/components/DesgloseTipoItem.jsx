import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { formatoPesos } from "../lib/format";

const COLOR_INGRESO = {
  SERVICIO: { color: "#0ea5e9", label: "Servicios" },
  BEBIDA: { color: "#f59e0b", label: "Bebidas" },
  CAPILAR: { color: "#8b5cf6", label: "Capilares" },
  OTRO: { color: "#94a3b8", label: "Otros ingresos" },
};

const COLOR_EGRESO = {
  COMPRA_INVENTARIO: { color: "#f59e0b", label: "Compra de inventario" },
  GASTO_FIJO: { color: "#f43f5e", label: "Gastos fijos" },
  OTRO: { color: "#64748b", label: "Otros gastos" },
  EGRESO: { color: "#64748b", label: "Otros gastos" },
};

function TooltipDonut({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800/95">
      <p className="font-bold text-slate-700 dark:text-slate-200">{d.name}</p>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{formatoPesos(d.value)}</p>
    </div>
  );
}

// Gajo activo: crece hacia afuera y le agrego un brillo (drop-shadow) del mismo color.
function GajoActivo(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g filter="url(#glowDonut)">
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 9} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

function Donut({ titulo, datos, vacioTexto }) {
  const [activo, setActivo] = useState(null);
  const total = datos.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{titulo}</h3>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{formatoPesos(total)}</span>
      </div>
      {total === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-slate-400">{vacioTexto}</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <defs>
                <filter id="glowDonut" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodOpacity="0.55" />
                </filter>
              </defs>
              <Pie
                data={datos}
                dataKey="value"
                nameKey="name"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                stroke="none"
                activeIndex={activo}
                activeShape={GajoActivo}
                onMouseEnter={(_, i) => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
              >
                {datos.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<TooltipDonut />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {datos.map((d, i) => (
              <span
                key={i}
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
                className={`flex cursor-default items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] transition ${
                  activo === i ? "bg-slate-100 font-bold text-slate-700 dark:bg-white/10 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DesgloseTipoItem({ movimientos }) {
  const datosIngresos = useMemo(() => {
    const mapa = {};
    movimientos
      .filter((m) => m.tipo === "INGRESO")
      .forEach((m) => {
        const clave = m.tipoItem || "OTRO";
        mapa[clave] = (mapa[clave] || 0) + m.monto;
      });
    return Object.entries(mapa)
      .map(([k, v]) => ({ name: (COLOR_INGRESO[k] || COLOR_INGRESO.OTRO).label, value: v, color: (COLOR_INGRESO[k] || COLOR_INGRESO.OTRO).color }))
      .sort((a, b) => b.value - a.value);
  }, [movimientos]);

  const datosEgresos = useMemo(() => {
    const mapa = {};
    movimientos
      .filter((m) => m.tipo === "EGRESO")
      .forEach((m) => {
        const clave = m.tipoItem || "OTRO";
        mapa[clave] = (mapa[clave] || 0) + m.monto;
      });
    return Object.entries(mapa)
      .map(([k, v]) => ({ name: (COLOR_EGRESO[k] || COLOR_EGRESO.OTRO).label, value: v, color: (COLOR_EGRESO[k] || COLOR_EGRESO.OTRO).color }))
      .sort((a, b) => b.value - a.value);
  }, [movimientos]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Donut titulo="¿De dónde viene la plata?" datos={datosIngresos} vacioTexto="Sin ingresos en este período" />
      <Donut titulo="¿En qué se va la plata?" datos={datosEgresos} vacioTexto="Sin egresos en este período" />
    </div>
  );
}