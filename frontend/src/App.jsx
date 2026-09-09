// Componente raíz: barra flotante + contenido + indicador global de caja.
// Al cambiar de pestaña, se muestra la pantalla de FadeOS con barra de carga, y se queda
// visible hasta que la pestaña nueva avise (vía useCargaGlobal) que ya terminó de verdad.
import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import { NegocioProvider, useNegocio } from "./lib/NegocioContext";
import { CargaProvider, useHayCargasActivas } from "./lib/CargaContext";
import Sidebar from "./components/Sidebar";
import EstadoCaja from "./components/EstadoCaja";
import { getCaja, urlArchivo } from "./lib/api";
import Inicio from "./pages/Inicio";
import Dashboard from "./pages/Dashboard";
import Comisiones from "./pages/Comisiones";
import Calendario from "./pages/Calendario";
import Caja from "./pages/Caja";
import Barberos from "./pages/Barberos";
import Reportes from "./pages/Reportes";
import Inventario from "./pages/Inventario";
import Configuracion from "./pages/Configuracion";
import GastosFijos from "./pages/GastosFijos";

// Overlay de transición: FadeOS + barra de carga.
function PantallaCarga() {
  const { nombre } = useNegocio();
  return (
    <div className="fixed inset-0 z-26 flex items-center justify-center bg-slate-100/95 backdrop-blur-sm dark:bg-slate-950/95 md:pl-64">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">FadeOS</p>
          {nombre && <p className="mt-1 text-xs font-medium text-slate-400">{nombre}</p>}
        </div>

        <div className="h-px w-48 overflow-hidden bg-slate-200 dark:bg-white/10">
          <div className="barra-carga h-full w-1/3 bg-linear-to-r from-transparent via-slate-900 to-transparent dark:via-white" />
        </div>

        <p className="text-[10px] font-medium tracking-wide text-slate-300 dark:text-slate-600">
          © {new Date().getFullYear()} FadeOS · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

function iniciales(nombre) {
  return (nombre || "F O").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

// Cabecera con logo/iniciales + nombre del negocio, visible SOLO en móvil
// (en escritorio ya está en el sidebar).
function CabeceraMovil() {
  const { nombre, logo } = useNegocio();
  return (
    <header className="mb-4 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 md:hidden">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-slate-600 to-slate-900 text-xs font-bold text-white">
        {logo ? (
          <img src={urlArchivo(logo)} alt="" className="h-full w-full object-contain bg-white" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          iniciales(nombre)
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{nombre}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">FadeOS</p>
      </div>
    </header>
  );
}

// Controla cuándo mostrar/ocultar el overlay: espera un mínimo de tiempo (para que la
// transición se sienta intencional) Y a que ya no haya ninguna pantalla cargando de verdad.
function usePantallaCarga(setVistaReal) {
  const [transicionando, setTransicionando] = useState(false);
  const [minimoCumplido, setMinimoCumplido] = useState(true);
  const hayCargasActivas = useHayCargasActivas();
  const timeoutsRef = useRef([]);

  const setVista = useCallback((nueva) => {
    setVistaReal((actual) => {
      if (actual === nueva) return actual;
      setTransicionando(true);
      setMinimoCumplido(false);
      const t1 = setTimeout(() => {
        setVistaReal(nueva);
        const t2 = setTimeout(() => setMinimoCumplido(true), 260);
        timeoutsRef.current.push(t2);
      }, 160);
      timeoutsRef.current.push(t1);
      return actual;
    });
  }, [setVistaReal]);

  useEffect(() => {
    if (transicionando && minimoCumplido && !hayCargasActivas) {
      const t = setTimeout(() => setTransicionando(false), 150);
      return () => clearTimeout(t);
    }
  }, [transicionando, minimoCumplido, hayCargasActivas]);

  useEffect(() => {
    if (!transicionando) return;
    const tope = setTimeout(() => setTransicionando(false), 4000);
    return () => clearTimeout(tope);
  }, [transicionando]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  return { setVista, transicionando };
}

function AppInterna() {
  const [vista, setVistaReal] = useState("inicio");
  const [fechaInicio, setFechaInicio] = useState(dayjs());
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [categoriaInventario, setCategoriaInventario] = useState("BEBIDA");

  const { setVista, transicionando } = usePantallaCarga(setVistaReal);

  const refrescarCaja = useCallback(async () => {
    try {
      const c = await getCaja(dayjs().hour(12).minute(0).second(0).toISOString());
      setEstadoCaja(c?.sesion || null);
    } catch {
      setEstadoCaja(null);
    }
  }, []);

  useEffect(() => { refrescarCaja(); }, [refrescarCaja]);

  function irADia(fecha) {
    setFechaInicio(fecha);
    setVista("inicio");
  }

  function alAbrirCaja(fecha) {
    refrescarCaja();
    setFechaInicio(fecha || dayjs());
    setVista("inicio");
  }

  return (
    <div className="aurora min-h-screen bg-slate-100">
      <Sidebar
        vista={vista}
        setVista={setVista}
        categoriaInventario={categoriaInventario}
        setCategoriaInventario={setCategoriaInventario}
      />
      <EstadoCaja sesion={estadoCaja} />

      {transicionando && <PantallaCarga />}

      <main className="relative z-25 px-4 pb-28 pt-6 md:py-8 md:pl-64 md:pr-8">
        <CabeceraMovil />
        {vista === "inicio" && <Inicio fechaInicial={fechaInicio} />}
        {vista === "movimientos" && <Dashboard />}
        {vista === "caja" && <Caja onCajaAbierta={alAbrirCaja} onCajaActualizada={refrescarCaja} />}
        {vista === "comisiones" && <Comisiones />}
        {vista === "barberos" && <Barberos />}
        {vista === "calendario" && <Calendario onIrADia={irADia} />}
        {vista === "reportes" && <Reportes />}
        {vista === "configuracion" && <Configuracion />}
        {vista === "gastos-fijos" && <GastosFijos />}
        {vista === "inventario" && (
          <Inventario categoria={categoriaInventario} setCategoria={setCategoriaInventario} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <NegocioProvider>
      <CargaProvider>
        <AppInterna />
      </CargaProvider>
    </NegocioProvider>
  );
}