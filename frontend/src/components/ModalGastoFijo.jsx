// Crear/editar un gasto fijo: nombre, monto, frecuencia y un color para identificarlo
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";

const FRECUENCIAS = [
  { dias: 7, label: "Semanal" },
  { dias: 15, label: "Quincenal" },
  { dias: 30, label: "Mensual" },
  { dias: 60, label: "Bimestral" },
];

const PALETA = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#64748b"];

export default function ModalGastoFijo({ gasto, onClose, onGuardar, guardando, error }) {
  const editando = !!gasto;
  const [nombre, setNombre] = useState(gasto?.nombre || "");
  const [monto, setMonto] = useState(gasto ? String(gasto.monto) : "");
  const [frecuenciaDias, setFrecuenciaDias] = useState(gasto ? String(gasto.frecuenciaDias) : "30");
  const [color, setColor] = useState(gasto?.color || PALETA[0]);

  function guardar() {
    onGuardar({
      nombre: nombre.trim(),
      monto: Number(monto) || 0,
      frecuenciaDias: Number(frecuenciaDias) || 30,
      color,
    });
  }

  const puedeGuardar = nombre.trim() && Number(monto) > 0 && Number(frecuenciaDias) > 0;

  return (
    <Modal titulo={editando ? "Editar gasto fijo" : "Nuevo gasto fijo"} onClose={onClose}>
      <label className="mb-1 block text-sm text-slate-600">Nombre del gasto</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Arriendo, Sueldo administrador..." className="campo mb-4" autoFocus />

      <label className="mb-1 block text-sm text-slate-600">Monto</label>
      <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="campo mb-4" />

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">¿Cada cuánto se paga?</p>
      <div className="mb-2 grid grid-cols-4 gap-2">
        {FRECUENCIAS.map((f) => (
          <button
            key={f.dias}
            type="button"
            onClick={() => setFrecuenciaDias(String(f.dias))}
            className={`rounded-xl border px-2 py-2.5 text-center text-xs font-semibold transition ${
              Number(frecuenciaDias) === f.dias ? "border-slate-800 bg-slate-50 dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {f.label}
            <span className="mt-0.5 block text-[10px] font-normal text-slate-400">{f.dias} días</span>
          </button>
        ))}
      </div>
      <label className="mb-1 block text-sm text-slate-600">O escribe los días exactos</label>
      <input type="number" value={frecuenciaDias} onChange={(e) => setFrecuenciaDias(e.target.value)} placeholder="30" className="campo mb-4" />

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Color para identificarlo</p>
      <div className="mb-4 flex items-center gap-2">
        {PALETA.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={`h-8 w-8 rounded-full border-2 transition ${color === c ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900" : "border-white"}`}
          />
        ))}
        <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />
        <label
          title="Elegir un color personalizado"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-slate-300 dark:border-slate-600"
          style={{ background: "conic-gradient(from 90deg, #f87171, #fbbf24, #34d399, #38bdf8, #a78bfa, #f87171)" }}
        >
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
      </div>

      {monto !== "" && frecuenciaDias !== "" && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
          <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: color }} />
          <p className="text-sm">
            <span className="font-bold">{formatoPesos(Number(monto) || 0)}</span> cada {frecuenciaDias} días
          </p>
        </div>
      )}

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={guardar}
        disabled={guardando || !puedeGuardar}
        className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {!editando && <Plus size={16} />}
        {editando && <Check size={16} />}
        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar gasto"}
      </button>
    </Modal>
  );
}