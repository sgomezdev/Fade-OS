import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Pencil, Trash2, Wallet, CalendarClock, TriangleAlert, ShieldCheck } from "lucide-react";
import { getGastosFijos, crearGastoFijo, actualizarGastoFijo, eliminarGastoFijo, marcarGastoPagado, getMovimientos } from "../lib/api";
import { formatoPesos } from "../lib/format";
import ModalGastoFijo from "../components/ModalGastoFijo";
import ModalPagarGasto from "../components/ModalPagarGasto";
import { useCargaGlobal } from "../lib/CargaContext";

const COLOR_DEFECTO = "#94a3b8";

function estadoDe(gasto) {
  const base = gasto.ultimoPago ? dayjs(gasto.ultimoPago) : dayjs(gasto.creadoEn);
  const proximo = base.add(gasto.frecuenciaDias, "day");
  const diasRestantes = proximo.diff(dayjs(), "day");
  if (diasRestantes < 0) return { texto: `Atrasado ${Math.abs(diasRestantes)}d`, clase: "bg-rose-50 text-rose-600" };
  if (diasRestantes <= 3) return { texto: diasRestantes === 0 ? "Vence hoy" : `Vence en ${diasRestantes}d`, clase: "bg-amber-50 text-amber-700" };
  return { texto: `En ${diasRestantes}d`, clase: "bg-emerald-50 text-emerald-700" };
}

function mensual(gasto) {
  return (gasto.monto / gasto.frecuenciaDias) * 30;
}

function TooltipDonut({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-700">{d.name}</p>
      <p className="text-slate-500">{formatoPesos(d.value)} / mes</p>
    </div>
  );
}

export default function GastosFijos() {
  const [gastos, setGastos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalPago, setModalPago] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [g, m] = await Promise.all([
        getGastosFijos(),
        getMovimientos({ desde: dayjs().subtract(29, "day").startOf("day").toISOString(), hasta: dayjs().endOf("day").toISOString() }),
      ]);
      setGastos(g);
      setMovimientos(m);
      setError(null);
    } catch (e) {
      setError("No se pudo cargar. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardarGasto(datos) {
    setErrorModal(null);
    setGuardando(true);
    try {
      if (modal !== "nuevo") await actualizarGastoFijo(modal.id, datos);
      else await crearGastoFijo(datos);
      setModal(null);
      cargar();
    } catch (e) {
      setErrorModal(e.response?.data?.error || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarPago(metodoPago) {
    setErrorModal(null);
    setGuardando(true);
    try {
      await marcarGastoPagado(modalPago.id, metodoPago);
      setModalPago(null);
      cargar();
    } catch (e) {
      setErrorModal(e.response?.data?.error || "No se pudo registrar el pago.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(gasto) {
    if (!window.confirm(`¿Quitar "${gasto.nombre}" de los gastos fijos?`)) return;
    try { await eliminarGastoFijo(gasto.id); cargar(); } catch (e) { alert("No se pudo eliminar."); }
  }

  const totalMensualEstimado = gastos.reduce((s, g) => s + mensual(g), 0);

  const datosDonut = useMemo(
    () => gastos.map((g) => ({ name: g.nombre, value: Math.round(mensual(g)), color: g.color || COLOR_DEFECTO })),
    [gastos]
  );

  const ingresos30dias = movimientos.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + m.monto, 0);
  const porcentaje = ingresos30dias > 0 ? (totalMensualEstimado / ingresos30dias) * 100 : 0;
  const salud =
    porcentaje === 0 ? { texto: "Sin datos suficientes", clase: "text-slate-400", Icono: ShieldCheck }
    : porcentaje < 30 ? { texto: "Saludable", clase: "text-emerald-600", Icono: ShieldCheck }
    : porcentaje < 60 ? { texto: "Ajustado", clase: "text-amber-600", Icono: TriangleAlert }
    : { texto: "Crítico", clase: "text-rose-600", Icono: TriangleAlert };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">GASTOS FIJOS</h1>
        </div>
        <button
          onClick={() => setModal("nuevo")}
          className="shine flex items-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus size={16} /> Agregar Gasto Fijo
        </button>
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-slate-950 p-6 text-white shadow-lg">
              <div className="pointer-events-none absolute -bottom-6 -right-4 text-white/5"><Wallet size={120} /></div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Gastos fijos por mes</p>
              <p className="mt-2 text-3xl font-black tracking-tight">{formatoPesos(Math.round(totalMensualEstimado))}</p>
              <p className="mt-2 text-xs text-white/60">Punto de equilibrio mínimo mensual</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Distribución</p>
              {datosDonut.length === 0 ? (
                <div className="flex h-36 items-center justify-center text-sm text-slate-400">Sin gastos fijos aún</div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={datosDonut} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={2} stroke="none">
                      {datosDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<TooltipDonut />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {datosDonut.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Vs. tus ingresos (30 días)</p>
              <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${porcentaje < 30 ? "bg-emerald-500" : porcentaje < 60 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, porcentaje)}%` }}
                />
              </div>
              <p className="mb-3 text-2xl font-black text-slate-900">{porcentaje.toFixed(0)}%</p>
              <p className={`flex items-center gap-1.5 text-sm font-bold ${salud.clase}`}>
                <salud.Icono size={16} /> {salud.texto}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Tus gastos fijos representan el {porcentaje.toFixed(0)}% de lo que generaste en los últimos 30 días ({formatoPesos(ingresos30dias)}).
              </p>
            </div>
          </div>

          {gastos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><Wallet size={26} /></span>
              <p className="text-slate-400">Aún no has agregado gastos fijos.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gastos.map((g) => {
                const estado = estadoDe(g);
                const color = g.color || COLOR_DEFECTO;
                return (
                  <div key={g.id} className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: color }}>
                          <Wallet size={20} />
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{g.nombre}</p>
                          <p className="text-xs text-slate-400">cada {g.frecuenciaDias} días</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        <button onClick={() => setModal(g)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={14} /></button>
                        <button onClick={() => eliminar(g)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-lg font-black text-slate-900">{formatoPesos(g.monto)}</span>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${estado.clase}`}>
                        <CalendarClock size={12} /> {estado.texto}
                      </span>
                    </div>

                    <button
                      onClick={() => setModalPago(g)}
                      className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Marcar como pagado
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {modal && (
        <ModalGastoFijo
          gasto={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onGuardar={guardarGasto}
          guardando={guardando}
          error={errorModal}
        />
      )}

      {modalPago && (
        <ModalPagarGasto
          gasto={modalPago}
          onClose={() => setModalPago(null)}
          onConfirmar={confirmarPago}
          guardando={guardando}
          error={errorModal}
        />
      )}
    </div>
  );
}