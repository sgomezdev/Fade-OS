// Genera un archivo con 3 hojas: Resumen, Movimientos y Barberos.
import { useState } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { CalendarDays, CalendarRange, CalendarClock, Download } from "lucide-react";
import { getMovimientos } from "../lib/api";
import { useCargaGlobal } from "../lib/CargaContext";

const METODOS = ["EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA", "OTRO"];
const TIPOS = ["SERVICIO", "BEBIDA", "CAPILAR"];


function inicioSemanaLunes(fecha) {
  const dia = fecha.day();
  const restar = dia === 0 ? 6 : dia - 1;
  return fecha.subtract(restar, "day").startOf("day");
}

// Construye el libro de Excel con 3 hojas a partir de los movimientos.
function construirLibro(movimientos, titulo) {
  // --- Hoja Movimientos ---
  const filasMov = movimientos.map((m) => ({
    Fecha: dayjs(m.fecha).format("YYYY-MM-DD HH:mm"),
    Tipo: m.tipo, Concepto: m.concepto, Barbero: m.barbero?.nombre || "",
    Metodo: m.metodoPago, TipoItem: m.tipoItem || "", Monto: m.monto,
  }));
  const wsMov = XLSX.utils.json_to_sheet(filasMov.length ? filasMov : [{ Fecha: "", Tipo: "", Concepto: "Sin movimientos", Barbero: "", Metodo: "", TipoItem: "", Monto: 0 }]);

  // --- Hoja Resumen ---
  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO");
  const egresos = movimientos.filter((m) => m.tipo === "EGRESO");
  const totalIng = ingresos.reduce((s, m) => s + m.monto, 0);
  const totalEgr = egresos.reduce((s, m) => s + m.monto, 0);
  const porMetodo = {}; ingresos.forEach((m) => { porMetodo[m.metodoPago] = (porMetodo[m.metodoPago] || 0) + m.monto; });
  const porTipo = {}; ingresos.forEach((m) => { const t = m.tipoItem || "OTRO"; porTipo[t] = (porTipo[t] || 0) + m.monto; });

  const aoa = [
    ["REPORTE", titulo], [],
    ["Ingresos", totalIng], ["Egresos", totalEgr], ["Utilidad", totalIng - totalEgr], [],
    ["Ingresos por método", ""], ...METODOS.filter((m) => porMetodo[m]).map((m) => [m, porMetodo[m]]), [],
    ["Ingresos por tipo", ""], ...TIPOS.filter((t) => porTipo[t]).map((t) => [t, porTipo[t]]),
  ];
  const wsRes = XLSX.utils.aoa_to_sheet(aoa);

  // --- Hoja Barberos ---
  const porBarbero = {};
  ingresos.filter((m) => m.barbero).forEach((m) => {
    const n = m.barbero.nombre;
    if (!porBarbero[n]) porBarbero[n] = { Barbero: n, Servicios: 0, Capilares: 0, Total: 0 };
    if (m.tipoItem === "SERVICIO") porBarbero[n].Servicios += m.monto;
    if (m.tipoItem === "CAPILAR") porBarbero[n].Capilares += m.monto;
    porBarbero[n].Total += m.monto;
  });
  const filasBarb = Object.values(porBarbero).map((b) => ({ Barbero: b.Barbero, Servicios: b.Servicios, Capilares: b.Capilares, "Total producido": b.Total }));
  const wsBarb = XLSX.utils.json_to_sheet(filasBarb.length ? filasBarb : [{ Barbero: "Sin datos", Servicios: 0, Capilares: 0, "Total producido": 0 }]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsRes, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsMov, "Movimientos");
  XLSX.utils.book_append_sheet(wb, wsBarb, "Barberos");
  return wb;
}

export default function Reportes() {
  const [dia, setDia] = useState(dayjs().format("YYYY-MM-DD"));
  const [semanaRef, setSemanaRef] = useState(dayjs().format("YYYY-MM-DD"));
  const [mes, setMes] = useState(dayjs().format("YYYY-MM"));
  const [generando, setGenerando] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);

  async function generar(clave, desde, hasta, titulo, archivo) {
    setError(null);
    setGenerando(clave);
    try {
      const movs = await getMovimientos({ desde, hasta });
      const wb = construirLibro(movs, titulo);
      XLSX.writeFile(wb, archivo + ".xlsx");
    } catch (e) {
      setError("No se pudo generar el reporte. ¿Está corriendo el backend?");
    } finally {
      setGenerando(null);
    }
  }

  const iniSemana = inicioSemanaLunes(dayjs(semanaRef));
  const finSemana = iniSemana.add(6, "day");
  const iniMes = dayjs(mes + "-01");
  const finMes = iniMes.endOf("month");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">REPORTES</h1>
        <p className="text-slate-500">Descarga los movimientos y el resumen en Excel</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Por día */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CalendarDays size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Por día</h2>
          <p className="mb-4 text-sm text-slate-500">Elige un día específico.</p>
          <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500" />
          <button onClick={() => generar("dia", dia, dia, `Día ${dia}`, `reporte-${dia}`)} disabled={generando === "dia"} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50">
            <Download size={16} /> {generando === "dia" ? "Generando..." : "Generar Excel"}
          </button>
        </div>

        {/* Por semana */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><CalendarRange size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Por semana</h2>
          <p className="mb-4 text-sm text-slate-500">Semana (lun–dom) del día que elijas.</p>
          <input type="date" value={semanaRef} onChange={(e) => setSemanaRef(e.target.value)} className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500" />
          <p className="mb-3 text-xs text-slate-400">{iniSemana.format("DD/MM")} – {finSemana.format("DD/MM/YYYY")}</p>
          <button onClick={() => generar("semana", iniSemana.format("YYYY-MM-DD"), finSemana.format("YYYY-MM-DD"), `Semana ${iniSemana.format("DD/MM")} - ${finSemana.format("DD/MM/YYYY")}`, `reporte-semana-${iniSemana.format("YYYY-MM-DD")}`)} disabled={generando === "semana"} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50">
            <Download size={16} /> {generando === "semana" ? "Generando..." : "Generar Excel"}
          </button>
        </div>

        {/* Por mes */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarClock size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Por mes</h2>
          <p className="mb-4 text-sm text-slate-500">Todo un mes completo.</p>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-slate-500" />
          <button onClick={() => generar("mes", iniMes.format("YYYY-MM-DD"), finMes.format("YYYY-MM-DD"), `Mes ${iniMes.format("MMMM YYYY")}`, `reporte-${mes}`)} disabled={generando === "mes"} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50">
            <Download size={16} /> {generando === "mes" ? "Generando..." : "Generar Excel"}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">Cada archivo trae 3 hojas: Resumen, Movimientos y Barberos.</p>
    </div>
  );
}