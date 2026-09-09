import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Banknote, Smartphone, CreditCard, Landmark, MoreHorizontal, Layers } from "lucide-react";

const METODOS = [
  { value: "todos", label: "Todos los métodos", Icono: Layers, color: "from-slate-400 to-slate-600" },
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, color: "from-emerald-400 to-emerald-600" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, color: "from-fuchsia-500 to-purple-700" },
  { value: "TARJETA", label: "Tarjeta", Icono: CreditCard, color: "from-sky-400 to-sky-600" },
  { value: "TRANSFERENCIA", label: "Transferencia", Icono: Landmark, color: "from-amber-300 to-amber-500" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, color: "from-slate-500 to-slate-700" },
];

export default function FiltroMetodoPago({ valor, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const actual = METODOS.find((m) => m.value === valor) || METODOS[0];

  useEffect(() => {
    function alClicFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="shine flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <span className={`flex h-5 w-5 items-center justify-center rounded-md bg-linear-to-br ${actual.color} text-white`}>
          <actual.Icono size={11} />
        </span>
        {actual.label}
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="ghost-in absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-white/50 bg-white/90 p-1.5 shadow-xl shadow-slate-400/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
          {METODOS.map((m) => (
            <button
              key={m.value}
              onClick={() => { onCambiar(m.value); setAbierto(false); }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br ${m.color} text-white`}>
                <m.Icono size={12} />
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-200">{m.label}</span>
              {valor === m.value && <Check size={14} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}