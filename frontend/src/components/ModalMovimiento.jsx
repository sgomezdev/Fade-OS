import { useEffect, useState } from "react";
import { ChevronLeft, Minus, Plus, Check, Banknote, Smartphone, CreditCard, Landmark, MoreHorizontal } from "lucide-react";
import Modal from "./Modal";
import { crearMovimiento, getBarberos, getProductos } from "../lib/api";
import { servicios, precioPara } from "../lib/catalogo";
import { formatoPesos } from "../lib/format";
import { Botella, Spray } from "./iconos";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700" },
  { value: "TARJETA", label: "Tarjeta", Icono: CreditCard, tile: "from-sky-400 to-sky-600" },
  { value: "TRANSFERENCIA", label: "Transferencia", Icono: Landmark, tile: "from-amber-300 to-amber-500" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700" },
];
const METODOS_SIN_EFECTIVO = METODOS.filter((m) => m.value !== "EFECTIVO");

const config = {
  servicio: { tituloModal: "Agregar servicio", label: "Servicio", catalogo: servicios, tipo: "INGRESO", conBarbero: true },
  bebida:   { tituloModal: "Agregar bebida", label: "Bebida", catalogo: [], dinamico: "BEBIDA", tipo: "INGRESO", conBarbero: false },
  capilar:  { tituloModal: "Agregar producto capilar", label: "Capilar", catalogo: [], dinamico: "CAPILAR", tipo: "INGRESO", conBarbero: true },
  egreso:   { tituloModal: "Registrar egreso", label: "Egreso", catalogo: [], tipo: "EGRESO", conBarbero: false },
};

function iconoCategoria(categoria) {
  return categoria === "CAPILAR"
    ? { Icono: Spray, gradient: "from-violet-400 to-violet-600" }
    : { Icono: Botella, gradient: "from-amber-400 to-amber-600" };
}

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function estiloPremium(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("gold"))
    return { clase: "prem-gold border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-700/60 dark:from-amber-900/50 dark:to-amber-800/40", texto: "text-amber-900 dark:text-amber-200", precio: "text-amber-700 dark:text-amber-300/90" };
  if (n.includes("silver") || n.includes("platino"))
    return { clase: "prem-silver border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 dark:border-slate-500 dark:from-slate-600 dark:to-slate-700", texto: "text-slate-800 dark:text-slate-100", precio: "text-slate-600 dark:text-slate-300" };
  if (n.includes("black"))
    return { clase: "prem-black border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 dark:border-slate-600", texto: "text-white", precio: "text-slate-300" };
  return { clase: "shine border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40", texto: "text-slate-800", precio: "text-slate-500" };
}

function estiloPorColor(color) {
  if (color === "GOLD")
    return { clase: "prem-gold border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-700/60 dark:from-amber-900/50 dark:to-amber-800/40", texto: "text-amber-900 dark:text-amber-200", precio: "text-amber-700 dark:text-amber-300/90" };
  if (color === "SILVER")
    return { clase: "prem-silver border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 dark:border-slate-500 dark:from-slate-600 dark:to-slate-700", texto: "text-slate-800 dark:text-slate-100", precio: "text-slate-600 dark:text-slate-300" };
  if (color === "BLACK")
    return { clase: "prem-black border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 dark:border-slate-600", texto: "text-white", precio: "text-slate-300" };
  if (typeof color === "string" && color.startsWith("#")) {
    return { clase: "shine", estiloInline: { borderColor: color, backgroundColor: `${color}1A` }, texto: "text-slate-800 dark:text-slate-100", precio: "text-slate-500" };
  }
  return null;
}

// Tarjeta de método de pago (reutilizable para el principal y el "resto" del pago dividido).
function TileMetodo({ m, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 ${
        activo ? "border-slate-800 bg-slate-50 shadow-sm dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br ${m.tile} text-white`}>
        <m.Icono size={16} />
      </span>
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{m.label}</span>
    </button>
  );
}

export default function ModalMovimiento({ modo, fecha, onClose, onCreado }) {
  const cfg = config[modo];
  const pasoInicial = cfg.conBarbero ? 1 : cfg.dinamico || cfg.catalogo.length > 0 ? 2 : 3;
  const { Icono: IconoCategoria, gradient: gradientCategoria } = iconoCategoria(cfg.dinamico);

  const [barberos, setBarberos] = useState([]);
  const [productosInventario, setProductosInventario] = useState([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [barbero, setBarbero] = useState(null);
  const [item, setItem] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [conPropina, setConPropina] = useState(false);
  const [propina, setPropina] = useState("");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [dividido, setDividido] = useState(false);
  const [efectivoParte, setEfectivoParte] = useState("");
  const [segundoMetodo, setSegundoMetodo] = useState("NEQUI");
  const [paso, setPaso] = useState(pasoInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cfg.conBarbero) getBarberos().then(setBarberos).catch(() => setError("No se pudieron cargar los barberos."));
  }, [cfg.conBarbero]);

  useEffect(() => {
    if (cfg.dinamico) {
      setCargandoInventario(true);
      getProductos()
        .then(setProductosInventario)
        .catch(() => setError("No se pudo cargar el inventario."))
        .finally(() => setCargandoInventario(false));
    }
  }, [cfg.dinamico]);

  const listaPaso2 = cfg.dinamico ? productosInventario.filter((p) => p.categoria === cfg.dinamico) : cfg.catalogo;

  function elegirBarbero(b) {
    setBarbero(b);
    if (item) setMonto(String((cfg.dinamico ? item.precioVenta : precioPara(item, b.id)) * cantidad));
    if (cfg.conceptoFijo) setConcepto(cfg.conceptoFijo);
    const hayPasoItem = cfg.dinamico || cfg.catalogo.length > 0;
    setPaso(hayPasoItem ? 2 : 3);
  }

  function elegirItem(it) {
    if (cfg.dinamico && it.stock <= 0) return;
    setItem(it);
    setCantidad(1);
    setConPropina(false);
    setPropina("");
    setConcepto(it.nombre);
    setMonto(String(cfg.dinamico ? it.precioVenta : precioPara(it, barbero?.id)));
    setPaso(3);
  }

  function cambiarCantidad(delta) {
    if (!item) return;
    const tope = cfg.dinamico ? item.stock : 10;
    const nueva = Math.min(tope, Math.max(1, cantidad + delta));
    setCantidad(nueva);
    setMonto(String((cfg.dinamico ? item.precioVenta : precioPara(item, barbero?.id)) * nueva));
  }

  function volver() {
    setError(null);
    const hayPasoItem = cfg.dinamico || cfg.catalogo.length > 0;
    if (paso === 3 && hayPasoItem) setPaso(2);
    else if (paso === 3 && cfg.conBarbero) setPaso(1);
    else if (paso === 2 && cfg.conBarbero) setPaso(1);
  }

  async function registrar() {
    setError(null);
    if (!concepto.trim()) return setError("Falta el concepto.");
    const total = Number(monto);
    if (!total || total <= 0) return setError("El monto debe ser mayor a 0.");

    const base = {
      tipo: cfg.tipo,
      concepto: concepto.trim(),
      barberoId: cfg.conBarbero ? barbero?.id : undefined,
      tipoItem: modo.toUpperCase(),
      fecha: fecha || undefined,
      productoId: cfg.dinamico && item ? item.id : undefined,
      cantidad: item ? cantidad : undefined,
    };

    try {
      setEnviando(true);
      if (dividido) {
        const parteEfectivo = Number(efectivoParte) || 0;
        const parteOtro = total - parteEfectivo;
        if (parteEfectivo <= 0 || parteOtro <= 0) { setEnviando(false); return setError("En pago dividido, ambas partes deben ser mayores a 0."); }
        await crearMovimiento({ ...base, monto: parteEfectivo, metodoPago: "EFECTIVO" });
        await crearMovimiento({ ...base, monto: parteOtro, metodoPago: segundoMetodo });
      } else {
        await crearMovimiento({ ...base, monto: total, metodoPago });
      }

      // La propina es un movimiento aparte: 100% del barbero, no entra en la comisión normal.
      if (cfg.conBarbero && conPropina && Number(propina) > 0) {
        await crearMovimiento({
          tipo: "INGRESO",
          concepto: `Propina - ${barbero?.nombre || ""}`.trim(),
          barberoId: barbero?.id,
          tipoItem: "PROPINA",
          fecha: fecha || undefined,
          monto: Number(propina),
          metodoPago: dividido ? "EFECTIVO" : metodoPago,
        });
      }

      onCreado();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar.");
    } finally {
      setEnviando(false);
    }
  }

  const puedeVolver = (paso === 2 && cfg.conBarbero) || (paso === 3 && (cfg.dinamico || cfg.catalogo.length > 0 || cfg.conBarbero));
  const pasos = ["Barbero", cfg.label, "Confirmar"];
  const resto = (Number(monto) || 0) - (Number(efectivoParte) || 0);

  return (
    <Modal titulo={cfg.tituloModal} onClose={onClose}>
      {cfg.conBarbero && (
        <div className="mb-5 flex items-center gap-2 text-xs">
          {pasos.map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 font-medium transition ${paso === i + 1 ? "bg-slate-900 text-white" : paso > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                {i + 1}. {p}
              </span>
              {i < pasos.length - 1 && <span className="text-slate-300">›</span>}
            </div>
          ))}
        </div>
      )}

      {puedeVolver && (
        <button onClick={volver} className="mb-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ChevronLeft size={16} /> Atrás
        </button>
      )}

      {paso === 1 && (
        <div key="p1" className="paso-in">
          <p className="mb-3 text-sm text-slate-600">¿Quién atiende?</p>
          {barberos.length === 0 ? (
            <p className="text-slate-400">Cargando barberos...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {barberos.map((b) => (
                <button key={b.id} onClick={() => elegirBarbero(b)}
                  className="shine flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-900 text-sm font-semibold text-white">
                    {iniciales(b.nombre)}
                  </span>
                  <span className="text-center text-sm font-medium text-slate-700">{b.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {paso === 2 && (
        <div key="p2" className="paso-in">
          <p className="mb-3 text-sm text-slate-600">Elige el {cfg.label.toLowerCase()}</p>
          {cfg.dinamico && cargandoInventario ? (
            <p className="text-slate-400">Cargando inventario...</p>
          ) : cfg.dinamico && listaPaso2.length === 0 ? (
            <p className="text-slate-400">No hay productos de este tipo en el inventario. Agrégalos en Productos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {listaPaso2.map((it) => {
                const prem = cfg.dinamico
                  ? estiloPorColor(it.color) || { clase: "shine border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-white/5 dark:hover:border-slate-500", texto: "text-slate-800 dark:text-slate-100", precio: "text-slate-500" }
                  : estiloPremium(it.nombre);
                const agotado = cfg.dinamico && it.stock <= 0;
                const img = cfg.dinamico ? it.imagen : null;
                return (
                  <button
                    key={it.id ?? it.nombre}
                    onClick={() => elegirItem(it)}
                    disabled={agotado}
                    style={prem.estiloInline}
                    className={`flex flex-col rounded-lg border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none ${prem.clase}`}
                  >
                    {cfg.dinamico && (
                      <div className="relative mb-2 flex h-16 w-full items-center justify-center overflow-hidden rounded-md bg-white/70">
                        {img && (
                          <img src={img} alt="" className="h-14 w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                        )}
                        <span style={{ display: img ? "none" : "flex" }} className={`h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${gradientCategoria} text-white`}>
                          <IconoCategoria size={20} />
                        </span>
                      </div>
                    )}
                    <p className={`text-sm font-medium ${prem.texto}`}>{it.nombre}</p>
                    <p className={`text-xs ${prem.precio}`}>{formatoPesos(cfg.dinamico ? it.precioVenta : precioPara(it, barbero?.id))}</p>
                    {cfg.dinamico && (
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${agotado ? "text-rose-500" : "text-slate-400"}`}>
                        {agotado ? "Agotado" : `${it.stock} en stock`}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {paso === 3 && (
        <div key="p3" className="paso-in">
          {item && (
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 px-4 py-3.5 dark:from-white/5 dark:to-white/10">
              <div>
                {barbero && <p className="text-xs text-slate-500">{barbero.nombre}</p>}
                <p className="font-bold text-slate-800 dark:text-slate-100">{item.nombre}</p>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{formatoPesos(Number(monto) || 0)}</span>
            </div>
          )}

          {item && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300">Cantidad</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => cambiarCantidad(-1)} disabled={cantidad <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-white/10 dark:text-slate-200">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-base font-black text-slate-900 dark:text-white">{cantidad}</span>
                <button type="button" onClick={() => cambiarCantidad(1)} disabled={cfg.dinamico && cantidad >= item.stock}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-white/10 dark:text-slate-200">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-sm text-slate-600">Concepto</label>
            <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder={modo === "egreso" ? "Ej: Compra de insumos" : ""} className="campo" />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-600">Monto total (puedes editarlo)</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="campo" />
          </div>

          {cfg.conBarbero && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={conPropina}
                  onChange={(e) => { setConPropina(e.target.checked); if (!e.target.checked) setPropina(""); }}
                  className="h-4 w-4"
                />
                Agregar propina (100% para {barbero?.nombre || "el barbero"})
              </label>
              {conPropina && (
                <input
                  type="number"
                  value={propina}
                  onChange={(e) => setPropina(e.target.value)}
                  placeholder="Monto de la propina"
                  className="campo mt-2"
                  autoFocus
                />
              )}
            </div>
          )}

          <label className="mb-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={dividido} onChange={(e) => setDividido(e.target.checked)} className="h-4 w-4" />
            Pago dividido (efectivo + otro método)
          </label>

          {!dividido ? (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((m) => (
                  <TileMetodo key={m.value} m={m} activo={metodoPago === m.value} onClick={() => setMetodoPago(m.value)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-white/5">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Parte en efectivo</label>
                <input type="number" value={efectivoParte} onChange={(e) => setEfectivoParte(e.target.value)} placeholder="0" className="campo" />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Resto en</p>
                <div className="grid grid-cols-4 gap-2">
                  {METODOS_SIN_EFECTIVO.map((m) => (
                    <TileMetodo key={m.value} m={m} activo={segundoMetodo === m.value} onClick={() => setSegundoMetodo(m.value)} />
                  ))}
                </div>
              </div>
              <p className={`text-sm font-medium ${resto > 0 ? "text-slate-700 dark:text-slate-200" : "text-rose-600"}`}>Resto en {segundoMetodo}: {formatoPesos(resto)}</p>
            </div>
          )}

          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button onClick={registrar} disabled={enviando} className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50">
            {enviando ? "Guardando..." : <><Check size={16} /> Registrar</>}
          </button>
        </div>
      )}

      {error && paso !== 3 && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}