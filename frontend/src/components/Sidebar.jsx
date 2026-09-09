import { useState, useEffect } from "react";
import { Home, Calendar, Lock, Percent, FileText, Sun, Moon, ChevronDown, Settings, Wallet } from "lucide-react";
import { Recibo, Bigote, Tijeras, Botella, Spray } from "./iconos";
import { useNegocio } from "../lib/NegocioContext";
import { urlArchivo } from "../lib/api";
import TransicionTema from "./TransicionTema";

const subProductos = [
  { categoria: "BEBIDA", etiqueta: "Bebidas", icono: Botella },
  { categoria: "CAPILAR", etiqueta: "Capilares", icono: Spray },
];

export default function Sidebar({ vista, setVista, categoriaInventario, setCategoriaInventario }) {
  const [oscuro, setOscuro] = useState(() => typeof localStorage !== "undefined" && localStorage.getItem("tema") === "oscuro");
  const [productosAbierto, setProductosAbierto] = useState(vista === "inventario");
  const [transicion, setTransicion] = useState(null);
  const { nombre, logo, mostrarGastosFijos } = useNegocio();

  const opciones = [
    { id: "inicio", etiqueta: "Inicio", icono: Home },
    { id: "movimientos", etiqueta: "Movimientos", icono: Recibo },
    { id: "caja", etiqueta: "Caja", icono: Lock },
    { id: "comisiones", etiqueta: "Comisiones", icono: Percent },
    { id: "barberos", etiqueta: "Barberos", icono: Bigote },
    { id: "calendario", etiqueta: "Calendario", icono: Calendar },
    { id: "reportes", etiqueta: "Reportes", icono: FileText },
    ...(mostrarGastosFijos ? [{ id: "gastos-fijos", etiqueta: "Gastos fijos", icono: Wallet }] : []),
    { id: "configuracion", etiqueta: "Configuración", icono: Settings },
  ];

  useEffect(() => {
    const raiz = document.documentElement;
    if (oscuro) raiz.classList.add("dark");
    else raiz.classList.remove("dark");
    localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
  }, [oscuro]);

  useEffect(() => {
    if (vista === "inventario") setProductosAbierto(true);
  }, [vista]);

  const clase = (activa) =>
    `shine flex h-11 w-11 shrink-0 items-center justify-center gap-3 rounded-2xl transition duration-200
     md:h-auto md:w-full md:justify-start md:px-3 md:py-2.5 ${
       activa
         ? "bg-gradient-to-br from-slate-500 to-slate-900 text-white shadow-md shadow-slate-900/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/40"
         : "text-slate-400 hover:-translate-y-0.5 hover:bg-white/60 hover:text-slate-700 hover:shadow-md hover:shadow-slate-300/60 hover:backdrop-blur dark:hover:bg-white/10 dark:hover:text-white md:text-slate-500"
     }`;

  function elegirProductos(categoria) {
    setVista("inventario");
    setCategoriaInventario(categoria);
  }

  function alPulsarProductos() {
    setProductosAbierto((v) => !v);
    setVista("inventario");
    setCategoriaInventario(categoriaInventario || "BEBIDA");
  }

  function alTema(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radioFinal = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vaAOscuro = !oscuro;

    if (vaAOscuro) {
      setTransicion({ x, y, radioFinal, creciendo: true });
    } else {
      setOscuro(false);
      setTransicion({ x, y, radioFinal, creciendo: false });
    }
  }

  function alCubrir() {
    setOscuro(true);
  }

  function terminarTransicion() {
    setTransicion(null);
  }

  return (
    <nav
      className="fixed z-30 flex border border-white/50 bg-white/70 shadow-xl shadow-slate-400/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60
                 bottom-4 left-1/2 max-w-[92vw] -translate-x-1/2 flex-row items-center gap-1 overflow-x-auto rounded-full p-2
                 md:inset-y-5 md:left-5 md:right-auto md:max-w-none md:w-56 md:translate-x-0 md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:rounded-3xl md:p-4"
    >
    <div className="hidden md:mb-3 md:flex md:items-center md:gap-2 md:px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-white">
          {logo ? (
            <img src={urlArchivo(logo)} alt="" className="h-full w-full object-contain bg-white" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <Tijeras size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-slate-900">{nombre}</p>
          <p className="text-xs text-slate-400">FadeOS</p>
        </div>
      </div>

      {/* Lista central: en móvil se comporta como si no existiera (contents);
          en escritorio se vuelve columna con scroll propio si hay muchos ítems. */}
      <div className="sidebar-scroll contents md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:overflow-x-hidden md:pr-1">
        {opciones.map((op) => {
          const Icono = op.icono;
          return (
            <button key={op.id} onClick={() => setVista(op.id)} title={op.etiqueta} className={clase(vista === op.id)}>
              <Icono size={20} />
              <span className="hidden text-sm font-medium md:inline">{op.etiqueta}</span>
            </button>
          );
        })}

        {/* Productos: desplegable con Bebidas / Capilares */}
        <div className="contents md:block md:w-full">
          <button
            onClick={alPulsarProductos}
            title="Productos"
            className={clase(vista === "inventario")}
          >
            <Botella size={20} />
            <span className="hidden flex-1 text-left text-sm font-medium md:inline">Productos</span>
            <ChevronDown size={15} className={`hidden transition-transform md:inline ${productosAbierto ? "rotate-180" : ""}`} />
          </button>

          {productosAbierto && (
            <div className="hidden flex-col gap-1 pl-4 pt-1 md:flex">
              {subProductos.map((sp) => {
                const Icono = sp.icono;
                const activa = vista === "inventario" && categoriaInventario === sp.categoria;
                return (
                  <button
                    key={sp.categoria}
                    onClick={() => elegirProductos(sp.categoria)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activa ? "bg-slate-200/70 text-slate-900 dark:bg-white/15 dark:text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <Icono size={16} />
                    {sp.etiqueta}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:mt-auto md:-mx-4 md:block md:border-t-2 md:border-slate-200 md:pt-3" />

      {transicion && (
        <TransicionTema
          x={transicion.x}
          y={transicion.y}
          radioFinal={transicion.radioFinal}
          creciendo={transicion.creciendo}
          onTerminar={terminarTransicion}
          onCubierto={alCubrir}
        />
      )}

      <button
        onClick={alTema}
        title={oscuro ? "Modo claro" : "Modo oscuro"}
        className="shine flex h-11 w-11 shrink-0 items-center justify-center gap-3 rounded-2xl text-slate-400 transition duration-200 hover:-translate-y-0.5 hover:bg-white/60 hover:text-slate-700 hover:shadow-md hover:shadow-slate-300/60 dark:hover:bg-white/10 dark:hover:text-white
        md:h-auto md:w-full md:justify-start md:px-3 md:py-2.5 md:text-slate-500"
      >
        {oscuro ? <Sun size={20} /> : <Moon size={20} />}
        <span className="hidden text-sm font-medium md:inline">{oscuro ? "Modo claro" : "Modo oscuro"}</span>
      </button>
    </nav>
  );
}