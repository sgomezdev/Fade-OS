import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { TrendingUp, TrendingDown, Scissors, Ticket, CalendarCheck, Percent, UserPlus } from "lucide-react";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getBarberos, getMovimientos } from "../lib/api";
import { formatoPesos } from "../lib/format";
import PodioBarberos from "../components/PodioBarberos";
import NumeroAnimado from "../components/NumeroAnimado";
import ModalBarbero from "../components/ModalBarbero";
import { useCargaGlobal } from "../lib/CargaContext";


const COMISION_CAPILAR_PCT = 20;
const RANGOS = [7, 14, 30];

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function calcularKPIs(movimientos, barbero) {
  const propios = movimientos.filter((m) => m.tipo === "INGRESO" && m.barberoId === barbero.id);
  const servicios = propios.filter((m) => m.tipoItem === "SERVICIO");
  const capilares = propios.filter((m) => m.tipoItem === "CAPILAR");
  const producido = propios.reduce((s, m) => s + m.monto, 0);
  const comision =
    servicios.reduce((s, m) => s + m.monto * (barbero.comisionPct / 100), 0) +
    capilares.reduce((s, m) => s + m.monto * (COMISION_CAPILAR_PCT / 100), 0);
  const cantidadServicios = servicios.length;
  const ticketPromedio = cantidadServicios ? servicios.reduce((s, m) => s + m.monto, 0) / cantidadServicios : 0;

  const porDia = {};
  propios.forEach((m) => {
    const k = dayjs(m.fecha).format("YYYY-MM-DD");
    porDia[k] = (porDia[k] || 0) + m.monto;
  });
  let mejorDia = null, mejorMonto = 0;
  Object.entries(porDia).forEach(([k, v]) => { if (v > mejorMonto) { mejorMonto = v; mejorDia = k; } });

  return { producido, comision, cantidadServicios, ticketPromedio, mejorDia, mejorMonto };
}

function TooltipArea({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-bold text-white">{label}</p>
      <p className="text-emerald-400">{formatoPesos(payload[0].value)}</p>
    </div>
  );
}

export default function Barberos() {
  const [barberos, setBarberos] = useState([]);
  const [dias, setDias] = useState(30);
  const [seleccion, setSeleccion] = useState("todos"); // "todos" | id
  const [movActual, setMovActual] = useState([]);
  const [movAnterior, setMovAnterior] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const hasta = dayjs().endOf("day");
  const desde = dayjs().subtract(dias - 1, "day").startOf("day");
  const antHasta = desde.subtract(1, "day").endOf("day");
  const antDesde = antHasta.subtract(dias - 1, "day").startOf("day");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [bs, actual, anterior] = await Promise.all([
        getBarberos(),
        getMovimientos({ desde: desde.toISOString(), hasta: hasta.toISOString() }),
        getMovimientos({ desde: antDesde.toISOString(), hasta: antHasta.toISOString() }),
      ]);
      setBarberos(bs);
      setMovActual(actual);
      setMovAnterior(anterior);
      setError(null);
    } catch (e) {
      setError("No se pudo cargar. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias]);

  useEffect(() => { cargar(); }, [cargar]);

  const ranking = useMemo(() => {
    return barberos
      .map((b) => ({ ...b, ...calcularKPIs(movActual, b) }))
      .sort((a, b) => b.producido - a.producido);
  }, [barberos, movActual]);

  const barberoSel = seleccion === "todos" ? null : ranking.find((b) => b.id === seleccion);
  const kpiAnteriorSel = barberoSel ? calcularKPIs(movAnterior, barberoSel) : null;
  const crecimiento =
    barberoSel && kpiAnteriorSel && kpiAnteriorSel.producido > 0
      ? ((barberoSel.producido - kpiAnteriorSel.producido) / kpiAnteriorSel.producido) * 100
      : null;

  const serieDiaria = useMemo(() => {
    if (!barberoSel) return [];
    const mapa = {};
    for (let i = 0; i < dias; i++) {
      const d = desde.add(i, "day");
      mapa[d.format("YYYY-MM-DD")] = { dia: d.format("DD/MM"), valor: 0 };
    }
    movActual
      .filter((m) => m.tipo === "INGRESO" && m.barberoId === barberoSel.id)
      .forEach((m) => {
        const k = dayjs(m.fecha).format("YYYY-MM-DD");
        if (mapa[k]) mapa[k].valor += m.monto;
      });
    return Object.values(mapa);
  }, [barberoSel, movActual, dias]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">BARBEROS</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalAbierto(true)}
            className="shine flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <UserPlus size={16} /> Agregar barbero
          </button>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {RANGOS.map((r) => (
              <button
                key={r}
                onClick={() => setDias(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${dias === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {r} días
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtro de barbero */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSeleccion("todos")}
          className={`shine rounded-xl px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
            seleccion === "todos" ? "bg-linear-to-br from-slate-700 to-slate-950 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          Todos
        </button>
        {ranking.map((b) => (
          <button
            key={b.id}
            onClick={() => setSeleccion(b.id)}
            className={`shine rounded-xl px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
              seleccion === b.id ? "bg-linear-to-br from-slate-700 to-slate-950 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {b.nombre}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : seleccion === "todos" ? (
        /* ===== COMPARATIVA: PODIO + LISTA COMPLETA ===== */
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Producción del período</p>
            <PodioBarberos ranking={ranking} />
          </div>

          <div className="space-y-3">
            {ranking.map((b, i) => (
              <div key={b.id} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:shadow-md">
                <span className="w-6 text-center text-sm font-black text-slate-300">#{i + 1}</span>
                <span className="avatar-burbuja flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-900 text-sm font-bold text-white">
                  {iniciales(b.nombre)}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{b.nombre}</p>
                  <p className="text-xs text-slate-400">{b.cantidadServicios} servicios · ticket prom. {formatoPesos(b.ticketPromedio)}</p>
                </div>
                <div className="text-right">
                  <NumeroAnimado valor={b.producido} className="font-black text-slate-900" />
                  <p className="text-xs font-semibold text-emerald-600">
                    comisión <NumeroAnimado valor={b.comision} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ===== INDIVIDUAL ===== */
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                <Percent size={13} /> Producido
              </p>
              <NumeroAnimado valor={barberoSel.producido} className="text-xl font-black text-slate-900" />
              {crecimiento != null && (
                <p className={`mt-1 flex items-center gap-1 text-xs font-bold ${crecimiento >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {crecimiento >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {Math.abs(crecimiento).toFixed(0)}% vs período anterior
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                <Scissors size={13} /> Comisión ganada
              </p>
              <NumeroAnimado valor={barberoSel.comision} className="text-xl font-black text-emerald-600" />
              <p className="mt-1 text-xs text-slate-400">{barberoSel.comisionPct}% servicios · 20% capilares</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                <Ticket size={13} /> Ticket promedio
              </p>
              <NumeroAnimado valor={barberoSel.ticketPromedio} className="text-xl font-black text-slate-900" />
              <p className="mt-1 text-xs text-slate-400">{barberoSel.cantidadServicios} servicios</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                <CalendarCheck size={13} /> Mejor día
              </p>
              <p className="text-xl font-black text-slate-900">{barberoSel.mejorDia ? dayjs(barberoSel.mejorDia).format("DD/MM") : "—"}</p>
              <p className="mt-1 text-xs text-slate-400">{barberoSel.mejorMonto ? <NumeroAnimado valor={barberoSel.mejorMonto} /> : "sin datos"}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 p-5 text-white shadow-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Producción diaria · {barberoSel.nombre}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={serieDiaria} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBarbero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(dias / 7) - 1)} />
                <Tooltip content={<TooltipArea />} cursor={{ stroke: "#64748b", strokeOpacity: 0.4 }} />
                <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2.5} fill="url(#fillBarbero)" className="glow-ing" dot={{ r: 3, fill: "#6ee7b7", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {modalAbierto && (
        <ModalBarbero
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar(); }}
        />
      )}
    </div>
  );
}