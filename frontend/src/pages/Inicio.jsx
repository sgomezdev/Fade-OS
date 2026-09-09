import { useEffect, useState, useCallback } from "react";
import { ArrowDownRight } from "lucide-react";
import dayjs from "dayjs";
import { Tijeras, Botella, Spray } from "../components/iconos";
import { getResumenDia, eliminarMovimiento } from "../lib/api";
import { formatoPesos } from "../lib/format";
import GraficoDia from "../components/GraficoDia";
import ModalMovimiento from "../components/ModalMovimiento";
import EditarMovimiento from "../components/EditarMovimiento";
import ListaMovimientos from "../components/ListaMovimientos";
import DiaNavegador from "../components/DiaNavegador";
import DesgloseMetodos from "../components/DesgloseMetodos";
import ResumenBarberos from "../components/ResumenBarberos";
import { useCargaGlobal } from "../lib/CargaContext";


const acciones = [
  { modo: "servicio", etiqueta: "Servicio", icono: Tijeras,      tint: "bg-emerald-500/10 border-emerald-300/50", icon: "from-emerald-400 to-emerald-600" },
  { modo: "bebida",   etiqueta: "Bebida",   icono: Botella,      tint: "bg-amber-500/10 border-amber-300/50",     icon: "from-amber-400 to-amber-600" },
  { modo: "capilar",  etiqueta: "Capilar",  icono: Spray,        tint: "bg-violet-500/10 border-violet-300/50",   icon: "from-violet-400 to-violet-600" },
  { modo: "egreso",   etiqueta: "Egreso",   icono: ArrowDownRight, tint: "bg-rose-500/10 border-rose-300/50",     icon: "from-rose-400 to-rose-600" },
];

export default function Inicio({ fechaInicial }) {
  const [fechaSel, setFechaSel] = useState(fechaInicial || dayjs());
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);
  const [modoModal, setModoModal] = useState(null);
  const [editando, setEditando] = useState(null);

  const esHoy = fechaSel.isSame(dayjs(), "day");

  const cargar = useCallback(async () => {
    try {
      const fechaConsulta = fechaSel.hour(12).minute(0).second(0).toISOString();
      const data = await getResumenDia(fechaConsulta);
      setResumen(data);
      setError(null);
    } catch (e) {
      setError("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
  }, [fechaSel]);

  useEffect(() => { cargar(); }, [cargar]);

  function fechaParaRegistrar() {
    if (esHoy) return null;
    const ahora = dayjs();
    return fechaSel.hour(ahora.hour()).minute(ahora.minute()).second(ahora.second()).toISOString();
  }

  async function eliminar(m) {
    if (!window.confirm(`¿Eliminar "${m.concepto}"? Esta acción no se puede deshacer.`)) return;
    try { await eliminarMovimiento(m.id); cargar(); } catch (e) { alert("No se pudo eliminar el movimiento."); }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">INICIO</h1>
        </div>
        <DiaNavegador fecha={fechaSel} onCambiar={setFechaSel} />
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <>
          {/* Hero: balance del día */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-slate-950 p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -bottom-6 -right-4 text-white/5">
              <Tijeras size={150} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Balance del día</p>
            <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatoPesos(resumen.balance)}</p>
            <div className="mt-6 flex gap-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">Ingresos</p>
                <p className="text-xl font-bold text-emerald-400">{formatoPesos(resumen.ingresos)}</p>
              </div>
              <div className="border-l border-white/10 pl-8">
                <p className="text-xs uppercase tracking-widest text-white/50">Egresos</p>
                <p className="text-xl font-bold text-rose-400">{formatoPesos(resumen.egresos)}</p>
              </div>
            </div>
          </div>

          {/* Registrar */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Registrar {esHoy ? "hoy" : "en este día"}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {acciones.map((a) => {
                const Icono = a.icono;
                return (
                  <button
                    key={a.modo}
                    onClick={() => setModoModal(a.modo)}
                    className={`liquid-glass flex flex-col items-center gap-3 rounded-2xl border p-5 ${a.tint}`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${a.icon} text-white shadow-sm`}>
                      <Icono size={24} />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide text-slate-700">{a.etiqueta}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analíticas del día */}
          <div className="grid gap-4 lg:grid-cols-3">
            <GraficoDia movimientos={resumen.movimientos} />
            <DesgloseMetodos porMetodo={resumen.porMetodo} />
            <ResumenBarberos movimientos={resumen.movimientos} />
          </div>

          {/* Lista del día */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Movimientos del día</p>
            <ListaMovimientos movimientos={resumen.movimientos} onEditar={setEditando} onEliminar={eliminar} />
          </div>
        </>
      )}

      {modoModal && (
        <ModalMovimiento modo={modoModal} fecha={fechaParaRegistrar()} onClose={() => setModoModal(null)} onCreado={() => { setModoModal(null); cargar(); }} />
      )}
      {editando && (
        <EditarMovimiento movimiento={editando} onClose={() => setEditando(null)} onGuardado={() => { setEditando(null); cargar(); }} />
      )}
    </div>
  );
}