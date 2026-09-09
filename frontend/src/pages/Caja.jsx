import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { Lock as LockIcon } from "lucide-react";
import { getCaja, abrirCaja, cerrarCaja } from "../lib/api";
import { formatoPesos } from "../lib/format";
import DiaNavegador from "../components/DiaNavegador";
import ModalAbrirCaja from "../components/ModalAbrirCaja";
import { useCargaGlobal } from "../lib/CargaContext";


function Dato({ label, valor, className = "text-slate-900" }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${className}`}>{valor}</p>
    </div>
  );
}

export default function Caja({ onCajaAbierta, onCajaActualizada }) {
  const [fechaSel, setFechaSel] = useState(dayjs());
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalAbrir, setModalAbrir] = useState(false);

  const [cierreReal, setCierreReal] = useState("");
  const [notas, setNotas] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const fecha = fechaSel.hour(12).minute(0).second(0).toISOString();
      setData(await getCaja(fecha));
      setError(null);
    } catch (e) {
      setError("No se pudo cargar la caja.");
    } finally {
      setCargando(false);
    }
  }, [fechaSel]);

  useEffect(() => { cargar(); }, [cargar]);

  async function abrir(montoTexto) {
    setError(null);
    if (montoTexto === "" || Number(montoTexto) < 0) return setError("Ingresa el fondo inicial (puede ser 0).");
    try {
      setGuardando(true);
      const fecha = fechaSel.hour(12).minute(0).second(0).toISOString();
      await abrirCaja(Number(montoTexto), fecha);
      setModalAbrir(false);
      if (onCajaAbierta) {
        onCajaAbierta(fechaSel);
      } else {
        await cargar();
        setGuardando(false);
      }
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo abrir la caja.");
      setGuardando(false);
    }
  }

  async function cerrar() {
    setError(null);
    if (cierreReal === "" || Number(cierreReal) < 0) return setError("Ingresa el efectivo contado en caja.");
    try {
      setGuardando(true);
      await cerrarCaja(sesion.id, Number(cierreReal), notas);
      await cargar();
      onCajaActualizada?.();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo cerrar la caja.");
    } finally {
      setGuardando(false);
    }
  }

  const sesion = data?.sesion || null;
  const esperado = data?.cierreEsperado ?? 0;
  const difLive = (Number(cierreReal) || 0) - esperado;
  const dif = sesion?.diferencia ?? 0;
  const abierta = sesion?.estado === "ABIERTA";
  const cerrada = sesion?.estado === "CERRADA";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">CAJA</h1>
        </div>
        <DiaNavegador fecha={fechaSel} onCambiar={setFechaSel} />
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error && !sesion && !modalAbrir ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : abierta ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-slate-950 p-6 text-white shadow-lg sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Efectivo esperado en caja</p>
            <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatoPesos(esperado)}</p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
              <span>Fondo inicial: <b className="text-white">{formatoPesos(sesion.montoInicial)}</b></span>
              <span className="text-emerald-300">+ Ingresos efectivo: {formatoPesos(data.efectivoIngresos)}</span>
              <span className="text-rose-300">− Egresos efectivo: {formatoPesos(data.efectivoEgresos)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Cerrar caja</p>
            <label className="mb-1 block text-sm text-slate-600">Efectivo contado (lo que hay físicamente)</label>
            <input type="number" value={cierreReal} onChange={(e) => setCierreReal(e.target.value)} placeholder="0"
              className="campo mb-3 max-w-xs" />

            {cierreReal !== "" && (
              <div className={`mb-4 inline-block rounded-xl px-4 py-2 text-sm font-semibold ${difLive === 0 ? "bg-slate-100 text-slate-700" : difLive > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {difLive === 0 ? "Cuadra exacto ✓" : difLive > 0 ? `Sobran ${formatoPesos(difLive)}` : `Faltan ${formatoPesos(Math.abs(difLive))}`}
              </div>
            )}

            <label className="mb-1 block text-sm text-slate-600">Notas (opcional)</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
              className="campo mb-4" />

            <button onClick={cerrar} disabled={guardando}
              className="shine rounded-xl bg-linear-to-br from-slate-700 to-slate-950 px-5 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50">
              {guardando ? "Cerrando..." : "Cerrar caja"}
            </button>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          </div>
        </>
      ) : cerrada ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Caja cerrada</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Dato label="Fondo inicial" valor={formatoPesos(sesion.montoInicial)} />
            <Dato label="Esperado" valor={formatoPesos(sesion.cierreEsperado)} />
            <Dato label="Contado" valor={formatoPesos(sesion.cierreReal)} />
            <Dato label="Diferencia" valor={dif === 0 ? "Exacto" : dif > 0 ? `+${formatoPesos(dif)}` : formatoPesos(dif)}
              className={dif === 0 ? "text-slate-900" : dif > 0 ? "text-emerald-600" : "text-rose-600"} />
          </div>
          <div className={`mt-4 inline-block rounded-xl px-4 py-2 text-sm font-semibold ${dif === 0 ? "bg-slate-100 text-slate-700" : dif > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {dif === 0 ? "La caja cuadró exacto ✓" : dif > 0 ? `Sobró ${formatoPesos(dif)}` : `Faltó ${formatoPesos(Math.abs(dif))}`}
          </div>
          {sesion.notas && <p className="mt-4 text-sm text-slate-500"><span className="font-semibold">Notas:</span> {sesion.notas}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-white/5">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-slate-700 to-slate-950 text-white shadow-lg">
            <LockIcon size={26} />
          </span>
          <p className="mb-1 text-lg font-bold text-slate-800 dark:text-white">La caja no está abierta</p>
          <p className="mb-5 max-w-xs text-sm text-slate-500 dark:text-slate-400">Abre la caja con un fondo inicial para empezar a registrar el efectivo del día.</p>
          <button
            onClick={() => setModalAbrir(true)}
            className="shine rounded-xl bg-linear-to-br from-slate-700 to-slate-950 px-6 py-2.5 font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Abrir caja
          </button>
        </div>
      )}

      {modalAbrir && (
        <ModalAbrirCaja
          onClose={() => setModalAbrir(false)}
          onAbrir={abrir}
          guardando={guardando}
          error={error}
        />
      )}
    </div>
  );
}