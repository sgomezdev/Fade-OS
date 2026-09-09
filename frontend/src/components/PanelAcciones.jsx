import { Scissors, Beer, SprayCan, ArrowDownRight } from "lucide-react";
import { formatoPesos } from "../lib/format";

const acciones = [
  { modo: "servicio", etiqueta: "Agregar servicio", icono: Scissors, clase: "bg-emerald-600 hover:bg-emerald-700" },
  { modo: "bebida", etiqueta: "Agregar bebida", icono: Beer, clase: "bg-amber-600 hover:bg-amber-700" },
  { modo: "capilar", etiqueta: "Producto capilar", icono: SprayCan, clase: "bg-slate-700 hover:bg-slate-800" },
  { modo: "egreso", etiqueta: "Registrar egreso", icono: ArrowDownRight, clase: "bg-rose-600 hover:bg-rose-700" },
];

export default function PanelAcciones({ onAccion, balance }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Agregar</p>

      {acciones.map((a) => {
        const Icono = a.icono;
        return (
          <button
            key={a.modo}
            onClick={() => onAccion(a.modo)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm transition ${a.clase}`}
          >
            <Icono size={18} />
            {a.etiqueta}
          </button>
        );
      })}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">Balance de hoy</p>
        <p className="text-2xl font-semibold text-slate-900">{formatoPesos(balance)}</p>
      </div>
    </div>
  );
}