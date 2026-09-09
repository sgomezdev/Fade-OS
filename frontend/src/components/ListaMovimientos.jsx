import { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronDown, Receipt, ArrowDownRight } from "lucide-react";
import { Tijeras, Botella, Spray } from "./iconos";
import { formatoPesos, formatoFechaHora } from "../lib/format";

const POR_PAGINA = 8;

// Estilo del ícono según el tipo de ítem.
const TIPO = {
  SERVICIO: { Icono: Tijeras, wrap: "bg-emerald-100 text-emerald-600" },
  BEBIDA:   { Icono: Botella, wrap: "bg-amber-100 text-amber-600" },
  CAPILAR:  { Icono: Spray,   wrap: "bg-violet-100 text-violet-600" },
  EGRESO:   { Icono: ArrowDownRight, wrap: "bg-rose-100 text-rose-600" },
};
const POR_DEFECTO = { Icono: Receipt, wrap: "bg-slate-100 text-slate-500" };

export default function ListaMovimientos({ movimientos, onEditar, onEliminar }) {
  const conAcciones = onEditar || onEliminar;
  const [visibles, setVisibles] = useState(POR_PAGINA);

  useEffect(() => { setVisibles(POR_PAGINA); }, [movimientos]);

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
          <Receipt size={26} />
        </div>
        <p className="text-sm text-slate-400">Sin movimientos este día</p>
      </div>
    );
  }

  const mostrados = movimientos.slice(0, visibles);
  const quedan = movimientos.length - mostrados.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2">
      <div className="space-y-0.5">
        {mostrados.map((m) => {
          const esIngreso = m.tipo === "INGRESO";
          const { Icono, wrap } = TIPO[m.tipoItem] || POR_DEFECTO;
          return (
            <div key={m.id} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
              {/* Ícono de color */}
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${wrap}`}>
                <Icono size={20} />
              </span>

              {/* Concepto + barbero + hora */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{m.concepto}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  {m.barbero?.nombre && <><span className="truncate">{m.barbero.nombre}</span><span>·</span></>}
                  <span>{formatoFechaHora(m.fecha)}</span>
                </div>
              </div>

              {/* Monto + método */}
              <div className="text-right">
                <p className={`font-bold ${esIngreso ? "text-emerald-600" : "text-rose-600"}`}>
                  {esIngreso ? "+" : "−"} {formatoPesos(m.monto)}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{m.metodoPago}</span>
              </div>

              {/* Acciones (aparecen al hover en escritorio; siempre visibles en móvil) */}
              {conAcciones && (
                <div className="flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  {onEditar && (
                    <button onClick={() => onEditar(m)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700" title="Editar">
                      <Pencil size={15} />
                    </button>
                  )}
                  {onEliminar && (
                    <button onClick={() => onEliminar(m)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {quedan > 0 ? (
        <button
          onClick={() => setVisibles((v) => v + POR_PAGINA)}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <ChevronDown size={16} /> Mostrar más ({quedan})
        </button>
      ) : (
        movimientos.length > POR_PAGINA && (
          <p className="py-2 text-center text-xs text-slate-400">Mostrando los {movimientos.length} movimientos</p>
        )
      )}
    </div>
  );
}