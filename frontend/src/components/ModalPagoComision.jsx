// Modal para registrar el pago de comisión a un barbero: método visual + pago dividido.
import { useState } from "react";
import { Banknote, Smartphone, Landmark, MoreHorizontal, Check } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600", tint: "bg-emerald-500/10 border-emerald-300/50" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700", tint: "bg-fuchsia-500/10 border-fuchsia-300/50" },
  { value: "TRANSFERENCIA", label: "Bancolombia", Icono: Landmark, tile: "from-amber-300 to-amber-500", tint: "bg-amber-400/10 border-amber-300/50" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700", tint: "bg-slate-500/10 border-slate-300/50" },
];

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Tile({ m, activo, onClick }) {
  const { Icono } = m;
  return (
    <button
      onClick={onClick}
      className={`liquid-glass relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition ${m.tint} ${
        activo ? "ring-2 ring-slate-800 dark:ring-white" : ""
      }`}
    >
      {activo && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${m.tile} text-white shadow-sm`}>
        <Icono size={20} />
      </span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.label}</span>
    </button>
  );
}

export default function ModalPagoComision({ barbero, onClose, onConfirmar, guardando, error }) {
  const [metodo, setMetodo] = useState("EFECTIVO");
  const [dividido, setDividido] = useState(false);
  const [efectivoParte, setEfectivoParte] = useState("");
  const [segundoMetodo, setSegundoMetodo] = useState("NEQUI");

  const total = barbero.montoNeto ?? barbero.comisionTotal;
  const resto = total - (Number(efectivoParte) || 0);
  const metodosResto = METODOS.filter((m) => m.value !== "EFECTIVO");

  function confirmar() {
    if (dividido) {
      const parte = Number(efectivoParte) || 0;
      if (parte <= 0 || resto <= 0) return;
      onConfirmar([
        { monto: parte, metodoPago: "EFECTIVO" },
        { monto: resto, metodoPago: segundoMetodo },
      ]);
    } else {
      onConfirmar([{ monto: total, metodoPago: metodo }]);
    }
  }

  const puedeConfirmar = dividido ? Number(efectivoParte) > 0 && resto > 0 : true;

  return (
    <Modal titulo="Registrar pago" onClose={onClose}>
      {/* Barbero + total */}
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-900 text-sm font-bold text-white">
          {iniciales(barbero.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{barbero.nombre}</p>
          <p className="text-xs text-slate-400">Comisión de la semana</p>
        </div>
        <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{formatoPesos(total)}</p>
      </div>

      {barbero.deudaPendiente > 0 && (
        <p className="mb-4 -mt-2 text-xs text-rose-500">
          Ya se le descontó {formatoPesos(barbero.deudaPendiente)} de deuda pendiente.
        </p>
      )}

      {!dividido && (
        <>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Método de pago</p>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {METODOS.map((m) => (
              <Tile key={m.value} m={m} activo={metodo === m.value} onClick={() => setMetodo(m.value)} />
            ))}
          </div>
        </>
      )}

      <label className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={dividido} onChange={(e) => setDividido(e.target.checked)} className="h-4 w-4" />
        Dividir el pago (efectivo + otro método)
      </label>

      {dividido && (
        <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-white/5">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Parte en efectivo</label>
            <input type="number" value={efectivoParte} onChange={(e) => setEfectivoParte(e.target.value)} placeholder="0" className="campo" />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Resto en</p>
            <div className="grid grid-cols-3 gap-2">
              {metodosResto.map((m) => (
                <Tile key={m.value} m={m} activo={segundoMetodo === m.value} onClick={() => setSegundoMetodo(m.value)} />
              ))}
            </div>
          </div>

          <p className={`text-sm font-semibold ${resto > 0 ? "text-slate-700 dark:text-slate-200" : "text-rose-600"}`}>
            Resto: {formatoPesos(resto)}
          </p>
        </div>
      )}

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={confirmar}
        disabled={guardando || !puedeConfirmar}
        className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {guardando ? "Registrando..." : `Registrar pago de ${formatoPesos(total)}`}
      </button>
    </Modal>
  );
}