// Donut de ingresos.
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatoPesos } from "../lib/format";

const COLORES = { SERVICIO: "#10b981", CAPILAR: "#8b5cf6", BEBIDA: "#f59e0b", OTROS: "#94a3b8" };
const ETIQUETAS = { SERVICIO: "Servicios", CAPILAR: "Capilares", BEBIDA: "Bebidas", OTROS: "Otros" };

export default function GraficoDia({ movimientos }) {
  const acumulado = {};
  (movimientos || [])
    .filter((m) => m.tipo === "INGRESO")
    .forEach((m) => {
      const clave = m.tipoItem || "OTROS";
      acumulado[clave] = (acumulado[clave] || 0) + m.monto;
    });

  const datos = Object.entries(acumulado).map(([clave, valor]) => ({
    name: ETIQUETAS[clave] || "Otros",
    value: valor,
    color: COLORES[clave] || COLORES.OTROS,
  }));
  const total = datos.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ingresos por tipo</h2>
      {datos.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-slate-300">
          <div className="mb-2 h-16 w-16 rounded-full border-4 border-dashed border-slate-200" />
          <p className="text-sm text-slate-400">Sin ingresos hoy</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={datos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">
                  {datos.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Total al centro */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black tracking-tight text-slate-900">{formatoPesos(total)}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hoy</span>
            </div>
          </div>
          {/* Leyenda */}
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {datos.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}