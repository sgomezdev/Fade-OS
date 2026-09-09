// Modal para editar un movimiento existente.
import { useState } from "react";
import Modal from "./Modal";
import { actualizarMovimiento } from "../lib/api";
import { formatoPesos } from "../lib/format";

const metodosPago = ["EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA", "OTRO"];

export default function EditarMovimiento({ movimiento, onClose, onGuardado }) {
  const [concepto, setConcepto] = useState(movimiento.concepto);
  const [monto, setMonto] = useState(String(movimiento.monto));
  const [metodoPago, setMetodoPago] = useState(movimiento.metodoPago);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function guardar() {
    setError(null);
    if (!concepto.trim()) return setError("Falta el concepto.");
    if (!monto || Number(monto) <= 0) return setError("El monto debe ser mayor a 0.");
    try {
      setEnviando(true);
      await actualizarMovimiento(movimiento.id, {
        concepto: concepto.trim(),
        monto: Number(monto),
        metodoPago,
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Editar movimiento" onClose={onClose}>
      <div className="mb-3">
        <label className="mb-1 block text-sm text-slate-600">Concepto</label>
        <input
          type="text"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm text-slate-600">Monto</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-slate-600">Método de pago</label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500"
        >
          {metodosPago.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm text-slate-500">Nuevo total: {formatoPesos(Number(monto) || 0)}</span>
        <button
          onClick={guardar}
          disabled={enviando}
          className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </Modal>
  );
}