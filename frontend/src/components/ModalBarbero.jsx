// Formulario para agregar un barbero nuevo
import { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "./Modal";
import { crearBarbero } from "../lib/api";

export default function ModalBarbero({ onClose, onGuardado }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comisionPct, setComisionPct] = useState("40");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function guardar() {
    setError(null);
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (comisionPct === "" || Number(comisionPct) < 0 || Number(comisionPct) > 100) {
      return setError("La comisión debe estar entre 0 y 100.");
    }

    setGuardando(true);
    try {
      await crearBarbero({
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        comisionPct: Number(comisionPct),
      });
      onGuardado();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const puedeGuardar = nombre.trim() && comisionPct !== "";

  return (
    <Modal titulo="Agregar barbero" onClose={onClose}>
      <label className="mb-1 block text-sm text-slate-600">Nombre completo</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="campo mb-4" autoFocus />

      <label className="mb-1 block text-sm text-slate-600">Teléfono (opcional)</label>
      <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="300 123 4567" className="campo mb-4" />

      <label className="mb-1 block text-sm text-slate-600">% de comisión en servicios</label>
      <input type="number" value={comisionPct} onChange={(e) => setComisionPct(e.target.value)} placeholder="40" className="campo mb-1" />
      <p className="mb-4 text-xs text-slate-400">Los productos capilares siempre pagan 20% fijo, aparte de esto.</p>

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={guardar}
        disabled={guardando || !puedeGuardar}
        className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <UserPlus size={16} /> {guardando ? "Guardando..." : "Agregar barbero"}
      </button>
    </Modal>
  );
}