import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MODOS = [
  { id: "dias", label: "Días" },
  { id: "mes", label: "Mes" },
  { id: "trimestre", label: "Trimestre" },
  { id: "anio", label: "Año" },
];

const RANGOS_DIAS = [7, 15, 30];

function calcularPeriodo(modo, diasSel, ancla) {
  if (modo === "dias") {
    return {
      desde: dayjs().subtract(diasSel - 1, "day").startOf("day"),
      hasta: dayjs().endOf("day"),
      etiqueta: `Últimos ${diasSel} días`,
    };
  }
  if (modo === "mes") {
    return { desde: ancla.startOf("month"), hasta: ancla.endOf("month"), etiqueta: ancla.format("MMMM YYYY") };
  }
  if (modo === "trimestre") {
    const q = Math.floor(ancla.month() / 3);
    const desde = ancla.month(q * 3).startOf("month");
    const hasta = desde.add(2, "month").endOf("month");
    return { desde, hasta, etiqueta: `T${q + 1} · ${ancla.year()}` };
  }
  return { desde: ancla.startOf("year"), hasta: ancla.endOf("year"), etiqueta: `${ancla.year()}` };
}

export default function SelectorPeriodo({ onCambiar }) {
  const [modo, setModo] = useState("dias");
  const [diasSel, setDiasSel] = useState(30);
  const [ancla, setAncla] = useState(dayjs());

  useEffect(() => {
    onCambiar(calcularPeriodo(modo, diasSel, ancla));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, diasSel, ancla]);

  function navegar(delta) {
    if (modo === "mes") setAncla((a) => a.add(delta, "month"));
    else if (modo === "trimestre") setAncla((a) => a.add(delta * 3, "month"));
    else if (modo === "anio") setAncla((a) => a.add(delta, "year"));
  }

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setAncla(dayjs());
  }

  const periodoActual = calcularPeriodo(modo, diasSel, ancla);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
        {MODOS.map((m) => (
          <button
            key={m.id}
            onClick={() => cambiarModo(m.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              modo === m.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modo === "dias" ? (
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {RANGOS_DIAS.map((d) => (
            <button
              key={d}
              onClick={() => setDiasSel(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                diasSel === d ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/70 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
          <button onClick={() => navegar(-1)} className="flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-white/70 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white">
            <ChevronLeft size={15} />
          </button>
          <p className="min-w-27.5 px-1 text-center text-xs font-bold capitalize text-slate-800 dark:text-slate-100">{periodoActual.etiqueta}</p>
          <button onClick={() => navegar(1)} className="flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-white/70 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white">
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}