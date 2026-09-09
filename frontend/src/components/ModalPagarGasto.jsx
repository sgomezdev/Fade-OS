// Confirma el pago de un gasto fijo: elige el método y crea el egreso real en Movimientos.
import { useState } from "react";
import { Banknote, Smartphone, CreditCard, Landmark, MoreHorizontal, Check } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700" },
  { value: "TARJETA", label: "Tarjeta", Icono: CreditCard, tile: "from-sky-400 to-sky-600" },
  { value: "TRANSFERENCIA", label: "Transferencia", Icono: Landmark, tile: "from-amber-300 to-amber-500" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700" },
];

export default function ModalPagarGasto({ gasto, onClose, onConfirmar, guardando, error }) {
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  return (
    <Modal titulo="Marcar como pagado" onClose={onClose}>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
        <p className="font-bold text-slate-800 dark:text-slate-100">{gasto.nombre}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white">{formatoPesos(gasto.monto)}</p>
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">¿Con qué pagaste?</p>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {METODOS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMetodoPago(m.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 ${
              metodoPago === m.value ? "border-slate-800 bg-slate-50 shadow-sm dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br ${m.tile} text-white`}>
              <m.Icono size={16} />
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{m.label}</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={() => onConfirmar(metodoPago)}
        disabled={guardando}
        className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <Check size={16} /> {guardando ? "Registrando..." : "Confirmar pago"}
      </button>
    </Modal>
  );
}