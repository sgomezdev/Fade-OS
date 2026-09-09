import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getMovimientos } from "../lib/api";
import { formatoPesos } from "../lib/format";
import { useCargaGlobal } from "../lib/CargaContext";

function TooltipGrafico({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-bold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {formatoPesos(p.value)}</p>
      ))}
    </div>
  );
}

export default function GraficoMovimientos({ desde, hasta }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    getMovimientos({ desde: desde.toISOString(), hasta: hasta.toISOString() })
      .then((data) => vivo && setMovimientos(data || []))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [desde, hasta]);

  const serie = useMemo(() => {
    const diffDias = hasta.diff(desde, "day");
    const porMes = diffDias > 62;
    const mapa = {};
    const orden = [];

    if (!porMes) {
      let cursor = desde.startOf("day");
      while (cursor.isBefore(hasta) || cursor.isSame(hasta, "day")) {
        const clave = cursor.format("YYYY-MM-DD");
        mapa[clave] = { etiqueta: cursor.format("DD/MM"), ingresos: 0, egresos: 0 };
        orden.push(clave);
        cursor = cursor.add(1, "day");
      }
    } else {
      let cursor = desde.startOf("month");
      while (cursor.isBefore(hasta) || cursor.isSame(hasta, "month")) {
        const clave = cursor.format("YYYY-MM");
        mapa[clave] = { etiqueta: cursor.format("MMM YY"), ingresos: 0, egresos: 0 };
        orden.push(clave);
        cursor = cursor.add(1, "month");
      }
    }

    movimientos.forEach((m) => {
      const fecha = dayjs(m.fecha);
      const clave = porMes ? fecha.format("YYYY-MM") : fecha.format("YYYY-MM-DD");
      if (!mapa[clave]) return;
      if (m.tipo === "INGRESO") mapa[clave].ingresos += m.monto;
      else mapa[clave].egresos += m.monto;
    });

    return orden.map((k) => mapa[k]);
  }, [movimientos, desde, hasta]);

  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 p-5 text-white shadow-lg">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ingresos vs. egresos</h2>
      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={serie} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#334155" strokeOpacity={0.3} />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipGrafico />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2.5} fill="url(#fillIngresos)" />
            <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#f43f5e" strokeWidth={2} fill="url(#fillEgresos)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}