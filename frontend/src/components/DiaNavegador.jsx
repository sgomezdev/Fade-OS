// Navegador de día con el mismo estilo del sidebar.
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

function etiquetaDia(fecha) {
  const hoy = dayjs();
  if (fecha.isSame(hoy, "day")) return "Hoy";
  if (fecha.isSame(hoy.subtract(1, "day"), "day")) return "Ayer";
  return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short" }).format(fecha.toDate());
}

export default function DiaNavegador({ fecha, onCambiar }) {
  const esHoy = fecha.isSame(dayjs(), "day");

  const boton = "shine flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-800 hover:shadow-md hover:shadow-slate-300/60 dark:hover:bg-white/10 dark:hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-md shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
      <button onClick={() => onCambiar(fecha.subtract(1, "day"))} className={boton}>
        <ChevronLeft size={16} /> Anterior
      </button>

      <div className="px-3 text-center">
        <p className="text-sm font-bold capitalize leading-tight text-slate-800">{etiquetaDia(fecha)}</p>
        <p className="text-[11px] text-slate-400">{fecha.format("DD/MM/YYYY")}</p>
      </div>

      <button onClick={() => onCambiar(fecha.add(1, "day"))} disabled={esHoy} className={boton}>
        Siguiente <ChevronRight size={16} />
      </button>
    </div>
  );
}