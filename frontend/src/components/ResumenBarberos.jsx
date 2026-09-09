import { useState, useEffect } from "react";
import { formatoPesos } from "../lib/format";

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function ResumenBarberos({ movimientos }) {
  const [animar, setAnimar] = useState(false);

  const mapa = {};
  (movimientos || [])
    .filter((m) => m.tipo === "INGRESO" && m.barbero)
    .forEach((m) => { mapa[m.barbero.nombre] = (mapa[m.barbero.nombre] || 0) + m.monto; });

  const filas = Object.entries(mapa).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total);
  const max = Math.max(1, ...filas.map((f) => f.total));

  useEffect(() => {
    setAnimar(false);
    const t = requestAnimationFrame(() => setAnimar(true));
    return () => cancelAnimationFrame(t);
  }, [filas.length, max]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Por barbero (hoy)</h2>
      {filas.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-slate-400">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">✂️</div>
          <p className="text-sm">Sin servicios hoy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filas.map((f, i) => {
            const pct = Math.round((f.total / max) * 100);
            const top = i === 0;
            return (
              <div key={f.nombre} className="group flex items-center gap-3">
                <span className={`avatar-burbuja flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${top ? "bg-linear-to-br from-slate-600 to-slate-900 ring-2 ring-amber-300" : "bg-slate-400"}`}>
                  {iniciales(f.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate font-medium text-slate-700">{f.nombre}</span>
                    <span className="font-semibold text-slate-800">{formatoPesos(f.total)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-linear-to-r from-slate-500 to-slate-800 transition-[width] duration-700 ease-out" style={{ width: animar ? `${pct}%` : "0%" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}