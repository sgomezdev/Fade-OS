import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Check, Info, Plus, TriangleAlert } from "lucide-react";
import { getComisiones, crearMovimiento, saldarDeudasBarbero } from "../lib/api";
import { formatoPesos } from "../lib/format";
import ModalPagoComision from "../components/ModalPagoComision";
import ModalDeudaBarbero from "../components/ModalDeudaBarbero";
import { useCargaGlobal } from "../lib/CargaContext";


function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function lunesDe(fecha) {
  const dia = fecha.day();
  const diff = dia === 0 ? -6 : 1 - dia;
  return fecha.add(diff, "day").startOf("day");
}

function TarjetaBarbero({ c, pagado, onPagar, acento = "slate" }) {
  const totalBg = acento === "amber" ? "bg-amber-50" : "bg-slate-50";
  const tieneDeuda = c.deudaPendiente > 0;
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="avatar-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-900 text-sm font-bold text-white">
          {iniciales(c.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-800">{c.nombre}</p>
          <p className="text-xs text-slate-400">{c.comisionPct}% de comisión</p>
        </div>
        {tieneDeuda && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
            <TriangleAlert size={11} /> Debe {formatoPesos(c.deudaPendiente)}
          </span>
        )}
      </div>

      <div className="mb-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Servicios</span>
          <span className="font-medium text-slate-700">{formatoPesos(c.comisionServicios)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Capilares</span>
          <span className="font-medium text-slate-700">{formatoPesos(c.comisionCapilares)}</span>
        </div>
        {c.comisionPropinas > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>Propinas <span className="text-[10px] font-bold text-emerald-500">100%</span></span>
            <span className="font-medium text-emerald-600">{formatoPesos(c.comisionPropinas)}</span>
          </div>
        )}
        {tieneDeuda && (
          <div className="flex justify-between text-rose-500">
            <span>− Deuda pendiente</span>
            <span className="font-medium">{formatoPesos(c.deudaPendiente)}</span>
          </div>
        )}
      </div>

      <div className={`mb-4 flex items-center justify-between rounded-xl px-3 py-2 ${totalBg}`}>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{tieneDeuda ? "Neto a pagar" : "Total"}</span>
        <span className="text-lg font-black text-slate-900">{formatoPesos(c.montoNeto ?? c.comisionTotal)}</span>
      </div>

      {pagado ? (
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700">
          <Check size={16} /> Pago registrado
        </div>
      ) : (
        <button
          onClick={onPagar}
          disabled={(c.montoNeto ?? c.comisionTotal) <= 0}
          className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40"
        >
          Registrar pago
        </button>
      )}
    </div>
  );
}

export default function Comisiones() {
  const [lunes, setLunes] = useState(() => lunesDe(dayjs()));
  const sabado = lunes.add(5, "day");
  const domingo = lunes.subtract(1, "day");

  const [comisionesSemana, setComisionesSemana] = useState([]);
  const [comisionesDomingo, setComisionesDomingo] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);

  const [pagadosSemana, setPagadosSemana] = useState(new Set());
  const [pagadosDomingo, setPagadosDomingo] = useState(new Set());

  const [modal, setModal] = useState(null);
  const [modalDeuda, setModalDeuda] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [semanaData, domingoData] = await Promise.all([
        getComisiones(lunes.toISOString(), sabado.endOf("day").toISOString()),
        getComisiones(domingo.startOf("day").toISOString(), domingo.endOf("day").toISOString()),
      ]);
      setComisionesSemana(semanaData);
      setComisionesDomingo(domingoData);
      setError(null);
    } catch (e) {
      setError("No se pudo cargar comisiones. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lunes]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagadosSemana(new Set()); setPagadosDomingo(new Set()); }, [lunes]);

  const totalSemana = comisionesSemana.reduce((s, c) => s + (c.montoNeto ?? c.comisionTotal), 0);
  const totalDomingo = comisionesDomingo.reduce((s, c) => s + (c.montoNeto ?? c.comisionTotal), 0);

  async function confirmarPago(pagos) {
    setErrorModal(null);
    setGuardando(true);
    try {
      const { tipo, barbero } = modal;
      for (const pago of pagos) {
        await crearMovimiento({
          tipo: "EGRESO",
          concepto: `Comisión ${tipo === "domingo" ? "domingo" : "semana"} · ${barbero.nombre}`,
          monto: pago.monto,
          metodoPago: pago.metodoPago,
          barberoId: barbero.id,
          fecha: dayjs().toISOString(),
        });
      }
      if (barbero.deudaPendiente > 0) await saldarDeudasBarbero(barbero.barberoId ?? barbero.id);

      if (tipo === "domingo") setPagadosDomingo((prev) => new Set(prev).add(barbero.nombre));
      else setPagadosSemana((prev) => new Set(prev).add(barbero.nombre));
      setModal(null);
      cargar();
    } catch (e) {
      setErrorModal(e.response?.data?.error || "No se pudo registrar el pago.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">COMISIONES</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalDeuda(true)}
            className="shine flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={16} /> Retiro / consumo
          </button>

          <div className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-md shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <button
              onClick={() => setLunes(lunes.subtract(7, "day"))}
              className="shine flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-800 hover:shadow-md dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="px-3 text-center">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Semana</p>
              <p className="text-[11px] text-slate-400">{lunes.format("DD/MM")} – {sabado.format("DD/MM/YYYY")}</p>
            </div>
            <button
              onClick={() => setLunes(lunes.add(7, "day"))}
              className="shine flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-800 hover:shadow-md dark:hover:bg-white/10 dark:hover:text-white"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-500 dark:bg-white/5">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>Lunes a sábado se paga el sábado. El domingo se paga aparte, ese mismo día. Los retiros/consumos se descuentan del pago.</p>
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-slate-950 p-6 text-white shadow-lg sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Total semana (paga el sábado)</p>
              <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatoPesos(totalSemana)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comisionesSemana.map((c) => (
                <TarjetaBarbero key={c.nombre} c={c} pagado={pagadosSemana.has(c.nombre)} onPagar={() => setModal({ tipo: "semana", barbero: c })} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Domingo · {domingo.format("DD/MM/YYYY")}</p>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Pago aparte</span>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-500 to-amber-700 p-6 text-white shadow-lg sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Total del domingo</p>
              <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatoPesos(totalDomingo)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comisionesDomingo.map((c) => (
                <TarjetaBarbero key={c.nombre} c={c} pagado={pagadosDomingo.has(c.nombre)} onPagar={() => setModal({ tipo: "domingo", barbero: c })} acento="amber" />
              ))}
            </div>
          </section>
        </>
      )}

      {modal && (
        <ModalPagoComision barbero={modal.barbero} onClose={() => setModal(null)} onConfirmar={confirmarPago} guardando={guardando} error={errorModal} />
      )}

      {modalDeuda && (
        <ModalDeudaBarbero onClose={() => setModalDeuda(false)} onRegistrado={() => { setModalDeuda(false); cargar(); }} />
      )}
    </div>
  );
}