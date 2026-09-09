import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { TrendingUp, TrendingDown, TriangleAlert } from "lucide-react";
import { getMovimientos } from "../lib/api";
import { formatoPesos } from "../lib/format";
import { useCargaGlobal } from "../lib/CargaContext";

const COLORES_CONFETI = ["#34d399", "#fbbf24", "#38bdf8", "#e879f9", "#ffffff", "#fde047"];

function estiloExplosion(distancia) {
  const angulo = Math.random() * Math.PI * 2;
  const dist = distancia * (0.6 + Math.random() * 0.6);
  return {
    "--dx": `${Math.cos(angulo) * dist}px`,
    "--dy": `${Math.sin(angulo) * dist - 20}px`,
    "--rot": `${Math.random() * 480 - 240}deg`,
    animationDelay: `${Math.random() * 120}ms`,
  };
}

function Confeti() {
  const piezas = Array.from({ length: 20 }, (_, i) => i);
  return <div className="capa-efecto">{piezas.map((i) => <span key={i} className="confeti-pieza" style={{ background: COLORES_CONFETI[i % COLORES_CONFETI.length], ...estiloExplosion(70) }} />)}</div>;
}
function CaritasTristes() {
  const piezas = Array.from({ length: 9 }, (_, i) => i);
  return <div className="capa-efecto">{piezas.map((i) => <span key={i} className="carita-pieza" style={estiloExplosion(55)}>😢</span>)}</div>;
}

// Calcula ingresos/COGS/gastos/utilidad de una lista ya filtrada de movimientos.
function calcularUtilidad(movimientos) {
  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + m.monto, 0);
  const costoVendido = movimientos
    .filter((m) => m.tipo === "INGRESO" && m.productoId && m.costoUnitario != null)
    .reduce((s, m) => s + m.costoUnitario * (m.cantidad || 1), 0);
  const gastosOperativos = movimientos
    .filter((m) => m.tipo === "EGRESO" && m.tipoItem !== "COMPRA_INVENTARIO")
    .reduce((s, m) => s + m.monto, 0);
  const margenBruto = ingresos - costoVendido;
  return { ingresos, costoVendido, gastosOperativos, margenBruto, utilidad: margenBruto - gastosOperativos };
}

export default function ResumenUtilidadReal({ desde, hasta }) {
  const [movimientos, setMovimientos] = useState([]);
  const [movAnterior, setMovAnterior] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [efecto, setEfecto] = useState(false);
  const [efectoKey, setEfectoKey] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let vivo = true;
    setCargando(true);

    const duracionDias = hasta.diff(desde, "day") + 1;
    const antHasta = desde.subtract(1, "day").endOf("day");
    const antDesde = antHasta.subtract(duracionDias - 1, "day").startOf("day");

    Promise.all([
      getMovimientos({ desde: desde.toISOString(), hasta: hasta.toISOString() }),
      getMovimientos({ desde: antDesde.toISOString(), hasta: antHasta.toISOString() }),
    ])
      .then(([actual, anterior]) => {
        if (!vivo) return;
        setMovimientos(actual || []);
        setMovAnterior(anterior || []);
      })
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [desde, hasta]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const { ingresos, costoVendido, gastosOperativos, margenBruto, utilidad: utilidadReal } = calcularUtilidad(movimientos);
  const anterior = calcularUtilidad(movAnterior);
  const crecimiento = anterior.ingresos > 0 ? ((ingresos - anterior.ingresos) / anterior.ingresos) * 100 : null;
  const esGanancia = utilidadReal >= 0;

  function celebrarOLamentar() {
    setEfectoKey((k) => k + 1);
    setEfecto(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setEfecto(false), 1100);
  }

  return (
    <div
      className={`rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
        esGanancia ? "border-emerald-100 hover:border-emerald-200 dark:border-emerald-900" : "border-rose-100 hover:border-rose-200 dark:border-rose-900"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          <TrendingUp size={13} /> Utilidad neta real
        </h2>
        {crecimiento != null && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${crecimiento >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
            {crecimiento >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(crecimiento).toFixed(0)}% vs. anterior
          </span>
        )}
      </div>
      <p className="mb-4 text-[11px] text-slate-400">Ingresos − costo de lo vendido − gastos operativos</p>

      {cargando ? (
        <p className="text-slate-400">Calculando...</p>
      ) : (
        <>
          <div className="space-y-1 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white dark:hover:bg-white/5">
              <span className="text-slate-500">Ingresos</span>
              <span className="font-semibold text-emerald-600">{formatoPesos(ingresos)}</span>
            </div>
            <div className="flex justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white dark:hover:bg-white/5">
              <span className="text-slate-500">− Costo de lo vendido</span>
              <span className="font-semibold text-rose-500">{formatoPesos(costoVendido)}</span>
            </div>
            <div className="flex justify-between rounded-lg border-t border-slate-200 px-2 py-1.5 pt-2.5 text-sm dark:border-slate-700">
              <span className="font-medium text-slate-600 dark:text-slate-300">= Margen bruto</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{formatoPesos(margenBruto)}</span>
            </div>
            <div className="flex justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white dark:hover:bg-white/5">
              <span className="text-slate-500">− Gastos operativos</span>
              <span className="font-semibold text-rose-500">{formatoPesos(gastosOperativos)}</span>
            </div>
          </div>

          <div className="relative mt-3">
            <button
              onClick={celebrarOLamentar}
              title={esGanancia ? "Dale clic para celebrar 🎉" : "Dale clic... ánimo"}
              className={`shine group relative w-full cursor-pointer overflow-hidden rounded-xl px-4 py-4 text-left text-white transition-shadow duration-300 ${
                esGanancia
                  ? "glow-flotar-ganancia bg-linear-to-br from-emerald-600 via-emerald-800 to-slate-950"
                  : "glow-flotar-perdida bg-linear-to-br from-rose-700 via-rose-900 to-slate-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {esGanancia ? <TrendingUp size={18} className="text-emerald-300" /> : <TriangleAlert size={18} className="animate-pulse text-rose-300" />}
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    {esGanancia ? "Utilidad neta real" : "Pérdida neta real"}
                  </span>
                </div>
                <span className={`text-2xl font-black tracking-tight ${esGanancia ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatoPesos(Math.abs(utilidadReal))}
                </span>
              </div>

              {efecto && (esGanancia ? <Confeti key={`c${efectoKey}`} /> : <CaritasTristes key={`s${efectoKey}`} />)}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            Las compras de inventario no se cuentan aquí como gasto (ya están reflejadas en el costo de lo vendido); sí afectan el efectivo en Caja.
          </p>
        </>
      )}
    </div>
  );
}