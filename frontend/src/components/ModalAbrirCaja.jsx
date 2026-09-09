// Modal de apertura de caja: montos rápidos + monto personalizado, estilo coherente con ModalMovimiento.
import { useState } from "react";
import { Lock } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";

const RAPIDOS = [0, 20000, 50000, 100000];

export default function ModalAbrirCaja({ onClose, onAbrir, guardando, error }) {
  const [monto, setMonto] = useState("");

  function elegirRapido(v) { setMonto(String(v)); }

  return (
    <Modal titulo="Abrir caja" onClose={onClose}>
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-700 to-slate-950 text-white">
          <Lock size={18} />
        </span>
        <p className="text-sm text-slate-600 dark:text-slate-300">¿Con cuánto efectivo arrancas el día?</p>
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Fondo rápido</p>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {RAPIDOS.map((v) => (
          <button
            key={v}
            onClick={() => elegirRapido(v)}
            className={`shine rounded-xl border px-2 py-2.5 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              monto === String(v)
                ? "border-transparent bg-linear-to-br from-slate-700 to-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {v === 0 ? "$0" : formatoPesos(v).replace("$", "$").replace(".000", "K")}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-sm text-slate-600">O escribe el monto exacto</label>
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="0"
        className="campo mb-4"
      />

      {monto !== "" && (
        <div className="mb-4 rounded-xl bg-slate-900 px-4 py-3 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Fondo inicial</p>
          <p className="text-xl font-bold">{formatoPesos(Number(monto) || 0)}</p>
        </div>
      )}

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={() => onAbrir(monto)}
        disabled={guardando || monto === ""}
        className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {guardando ? "Abriendo..." : "Abrir caja"}
      </button>
    </Modal>
  );
}