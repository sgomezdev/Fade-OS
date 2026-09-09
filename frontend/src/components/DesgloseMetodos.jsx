import { useState, useEffect } from "react";
import { Banknote, Smartphone, CreditCard, Landmark, MoreHorizontal, Wallet } from "lucide-react";
import { formatoPesos } from "../lib/format";
import NumeroAnimado from "./NumeroAnimado";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700" },
  { value: "TARJETA", label: "Tarjeta", Icono: CreditCard, tile: "from-sky-400 to-sky-600" },
  { value: "TRANSFERENCIA", label: "Transferencia", Icono: Landmark, tile: "from-amber-300 to-amber-500" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700" },
];

export default function DesgloseMetodos({ porMetodo }) {
  const [animar, setAnimar] = useState(false);
  const entradas = METODOS.filter((m) => (porMetodo?.[m.value] || 0) > 0);
  const total = entradas.reduce((s, m) => s + porMetodo[m.value], 0);

  useEffect(() => {
    setAnimar(false);
    const t = requestAnimationFrame(() => setAnimar(true));
    return () => cancelAnimationFrame(t);
  }, [total]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ingresos por método</h2>
        {total > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
            {formatoPesos(total)}
          </span>
        )}
      </div>

      {entradas.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-slate-400">
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300 dark:bg-white/5">
            <Wallet size={22} />
          </span>
          <p className="text-sm">Sin ingresos en este período</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entradas.map((m) => {
            const valor = porMetodo[m.value];
            const pct = total ? Math.round((valor / total) * 100) : 0;
            return (
              <div key={m.value} className="-mx-2 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-white/5">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br ${m.tile} text-white`}>
                      <m.Icono size={12} />
                    </span>
                    {m.label}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    <NumeroAnimado valor={valor} /> <span className="font-normal text-slate-400">· {pct}%</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full bg-linear-to-br ${m.tile} transition-[width] duration-700 ease-out`}
                    style={{ width: animar ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}