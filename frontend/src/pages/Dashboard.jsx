import { useState, useCallback, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Trash2, TrendingUp, TrendingDown, Search, X } from "lucide-react";
import SelectorPeriodo from "../components/SelectorPeriodo";
import ResumenUtilidadReal from "../components/ResumenUtilidadReal";
import GraficoMovimientos from "../components/GraficoMovimientos";
import DesgloseMetodos from "../components/DesgloseMetodos";
import DesgloseTipoItem from "../components/DesgloseTipoItem";
import FiltroMetodoPago from "../components/FiltroMetodoPago";
import { getMovimientos, eliminarMovimiento } from "../lib/api";
import { formatoPesos } from "../lib/format";
import { useCargaGlobal } from "../lib/CargaContext";

export default function Dashboard() {
  const [periodo, setPeriodo] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos | INGRESO | EGRESO
  const [filtroMetodo, setFiltroMetodo] = useState("todos");

  const cargarLista = useCallback(async () => {
    if (!periodo) return;
    setCargando(true);
    try {
      const data = await getMovimientos({ desde: periodo.desde.toISOString(), hasta: periodo.hasta.toISOString() });
      setMovimientos((data || []).slice().sort((a, b) => dayjs(b.fecha).diff(dayjs(a.fecha))));
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => { cargarLista(); }, [cargarLista]);

  async function eliminar(id) {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    try { await eliminarMovimiento(id); cargarLista(); } catch (e) { alert("No se pudo eliminar."); }
  }

  const porMetodoIngresos = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => {
      acc[m.metodoPago] = (acc[m.metodoPago] || 0) + m.monto;
      return acc;
    }, {});

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return movimientos.filter((m) => {
      if (filtroTipo !== "todos" && m.tipo !== filtroTipo) return false;
      if (filtroMetodo !== "todos" && m.metodoPago !== filtroMetodo) return false;
      if (texto && !m.concepto?.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [movimientos, busqueda, filtroTipo, filtroMetodo]);

  const hayFiltrosActivos = busqueda || filtroTipo !== "todos" || filtroMetodo !== "todos";

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroTipo("todos");
    setFiltroMetodo("todos");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">MOVIMIENTOS</h1>
        </div>
        <SelectorPeriodo onCambiar={setPeriodo} />
      </div>

      {periodo && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ResumenUtilidadReal desde={periodo.desde} hasta={periodo.hasta} />
            <GraficoMovimientos desde={periodo.desde} hasta={periodo.hasta} />
          </div>

          <DesgloseMetodos porMetodo={porMetodoIngresos} />

          <DesgloseTipoItem movimientos={movimientos} />

          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Movimientos · {periodo.etiqueta}</h2>
                <span className="text-xs text-slate-400">
                  {movimientosFiltrados.length} de {movimientos.length} registro{movimientos.length !== 1 && "s"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-50 flex-1">
                  <Search
                    size={15}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      busqueda ? "text-slate-600 dark:text-slate-200" : "text-slate-400"
                    }`}
                  />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por concepto..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:shadow-md dark:border-slate-700 dark:bg-white/5 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:bg-slate-800"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "INGRESO", label: "Ingresos" },
                    { id: "EGRESO", label: "Egresos" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFiltroTipo(t.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        filtroTipo === t.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <FiltroMetodoPago valor={filtroMetodo} onCambiar={setFiltroMetodo} />

                {hayFiltrosActivos && (
                  <button onClick={limpiarFiltros} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
                    <X size={13} /> Limpiar
                  </button>
                )}
              </div>
            </div>

            {cargando ? (
              <p className="p-5 text-sm text-slate-400">Cargando...</p>
            ) : movimientosFiltrados.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">
                {movimientos.length === 0 ? "No hay movimientos en este período." : "Ningún movimiento coincide con el filtro."}
              </p>
            ) : (
              <div className="max-h-105 divide-y divide-slate-100 overflow-y-auto scroll-fino dark:divide-slate-800">
                {movimientosFiltrados.map((m) => (
                  <div key={m.id} className="group flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-white/5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.tipo === "INGRESO" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                      {m.tipo === "INGRESO" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{m.concepto}</p>
                      <p className="text-xs text-slate-400">{dayjs(m.fecha).format("DD MMM YYYY · HH:mm")} · {m.metodoPago}</p>
                    </div>
                    <span className={`text-sm font-bold ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-rose-500"}`}>
                      {m.tipo === "INGRESO" ? "+" : "−"}{formatoPesos(m.monto)}
                    </span>
                    <button onClick={() => eliminar(m.id)} className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}