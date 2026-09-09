import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { getResumenCalendario, getBarberos } from "../lib/api";
import NumeroAnimado from "../components/NumeroAnimado";
import { useCargaGlobal } from "../lib/CargaContext";
import { formatoPesos, formatoCompacto  } from "../lib/format";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function colorDia(balance, maxAbs) {
  if (balance == null || maxAbs === 0) {
    return { bg: "transparent", texto: "text-slate-500 dark:text-slate-400", glow: "transparent" };
  }
  const intensidad = Math.min(1, Math.abs(balance) / maxAbs);
  if (balance >= 0) {
    const alpha = 0.1 + intensidad * 0.55;
    return {
      bg: `rgba(16,185,129,${alpha})`,
      texto: intensidad > 0.55 ? "text-white" : "text-emerald-800 dark:text-emerald-200",
      glow: `rgba(16,185,129,${0.35 + intensidad * 0.45})`,
    };
  }
  const alpha = 0.1 + intensidad * 0.55;
  return {
    bg: `rgba(244,63,94,${alpha})`,
    texto: intensidad > 0.55 ? "text-white" : "text-rose-800 dark:text-rose-200",
    glow: `rgba(244,63,94,${0.35 + intensidad * 0.45})`,
  };
}

// Tarjeta de total, estilo vidrio, con ícono y barrita de acento arriba.
function TarjetaTotal({ Icono, label, valor, acento, colorTexto }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-4 shadow-md shadow-slate-300/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${acento}`} />
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        <Icono size={13} />
        <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
      </div>
      <NumeroAnimado valor={valor} formatear={formatoCompacto} className={`text-lg font-black md:hidden ${colorTexto}`} />
      <NumeroAnimado valor={valor} formatear={formatoPesos} className={`hidden text-lg font-black md:inline ${colorTexto}`} />
    </div>
  );
}

export default function Calendario({ onIrADia }) {
  const [mes, setMes] = useState(dayjs().startOf("month"));
  const [barberos, setBarberos] = useState([]);
  const [barberoId, setBarberoId] = useState(null);
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);

  useEffect(() => { getBarberos().then(setBarberos).catch(() => {}); }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const desde = mes.startOf("month").toISOString();
      const hasta = mes.endOf("month").toISOString();
      const data = await getResumenCalendario(desde, hasta, barberoId || undefined);
      setDatos(data || []);
      setError(null);
    } catch (e) {
      setError("No se pudo cargar el calendario.");
    } finally {
      setCargando(false);
    }
  }, [mes, barberoId]);

  useEffect(() => { cargar(); }, [cargar]);

  const mapaPorDia = useMemo(() => {
    const m = {};
    datos.forEach((d) => { m[dayjs(d.fecha).format("YYYY-MM-DD")] = d; });
    return m;
  }, [datos]);

  const maxAbs = useMemo(() => Math.max(1, ...datos.map((d) => Math.abs(d.balance))), [datos]);

  const celdas = useMemo(() => {
    const inicioMes = mes.startOf("month");
    const finMes = mes.endOf("month");
    const primerDiaSemana = (inicioMes.day() + 6) % 7;
    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) dias.push(null);
    for (let d = 0; d < finMes.date(); d++) dias.push(inicioMes.add(d, "day"));
    return dias;
  }, [mes]);

  const totalIngresos = datos.reduce((s, d) => s + d.ingresos, 0);
  const totalEgresos = datos.reduce((s, d) => s + d.egresos, 0);
  const totalBalance = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">CALENDARIO</h1>
        </div>
        <div className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-md shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
          <button onClick={() => setMes(mes.subtract(1, "month"))} className="shine flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-800 hover:shadow-md dark:hover:bg-white/10 dark:hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <p className="min-w-35 text-center text-sm font-bold capitalize text-slate-800 dark:text-slate-100">{mes.format("MMMM YYYY")}</p>
          <button onClick={() => setMes(mes.add(1, "month"))} className="shine flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-800 hover:shadow-md dark:hover:bg-white/10 dark:hover:text-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setBarberoId(null)}
          className={`shine rounded-xl px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
            !barberoId ? "bg-linear-to-br from-slate-700 to-slate-950 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          Todos
        </button>
        {barberos.map((b) => (
          <button
            key={b.id}
            onClick={() => setBarberoId(b.id)}
            className={`shine rounded-xl px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${
              barberoId === b.id ? "bg-linear-to-br from-slate-700 to-slate-950 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {b.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TarjetaTotal Icono={TrendingUp} label="Ingresos" valor={totalIngresos} acento="from-emerald-400 to-emerald-600" colorTexto="text-emerald-600" />
        <TarjetaTotal Icono={TrendingDown} label="Egresos" valor={totalEgresos} acento="from-rose-400 to-rose-600" colorTexto="text-rose-500" />
        <TarjetaTotal Icono={Scale} label="Balance" valor={totalBalance} acento="from-slate-500 to-slate-800" colorTexto="text-slate-900 dark:text-white" />
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <div
          key={mes.format("YYYY-MM")}
          className="paso-in rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl shadow-slate-400/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50"
        >
          <div className="mb-2 grid grid-cols-7 gap-2">
            {DIAS_SEMANA.map((d) => (
              <p key={d} className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {celdas.map((fecha, i) => {
              if (!fecha) return <div key={`vacio-${i}`} />;
              const clave = fecha.format("YYYY-MM-DD");
              const info = mapaPorDia[clave];
              const balance = info ? info.balance : null;
              const { bg, texto, glow } = colorDia(balance, maxAbs);
              const esHoy = fecha.isSame(dayjs(), "day");
              return (
                <button
                  key={clave}
                  onClick={() => onIrADia && onIrADia(fecha)}
                  style={{ backgroundColor: bg, "--glow": glow, animationDelay: `${i * 14}ms` }}
                  className={`dia-entra group relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border border-slate-100/70 transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:scale-110 hover:border-transparent hover:shadow-[0_0_22px_2px_var(--glow)] dark:border-slate-800/70 ${
                    esHoy ? "pulso-hoy ring-2 ring-slate-800 dark:ring-white" : ""
                  }`}
                >
                  <span className={`text-xs font-bold ${texto}`}>{fecha.date()}</span>
                  {info && (
                    <span className={`hidden text-[9px] font-semibold sm:block ${texto}`}>
                      {balance >= 0 ? "+" : "−"}{Math.round(Math.abs(balance) / 1000)}k
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Escala de calor, tipo dashboard */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-500">Flojo</span>
            <div
              className="h-2 flex-1 rounded-full"
              style={{ background: "linear-gradient(90deg, rgba(244,63,94,0.65), rgba(226,232,240,0.6), rgba(16,185,129,0.65))" }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Fuerte</span>
          </div>
        </div>
      )}
    </div>
  );
}