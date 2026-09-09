import { useState, useEffect } from "react";
import { Banknote, Smartphone, CreditCard, Landmark, MoreHorizontal, Package, Wallet, Check } from "lucide-react";
import Modal from "./Modal";
import { getBarberos, getProductos, registrarRetiroBarbero, registrarConsumoBarbero } from "../lib/api";
import { formatoPesos } from "../lib/format";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700" },
  { value: "TARJETA", label: "Tarjeta", Icono: CreditCard, tile: "from-sky-400 to-sky-600" },
  { value: "TRANSFERENCIA", label: "Transferencia", Icono: Landmark, tile: "from-amber-300 to-amber-500" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700" },
];

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function ModalDeudaBarbero({ barberoInicial, onClose, onRegistrado }) {
  const [tipo, setTipo] = useState("retiro");
  const [barberos, setBarberos] = useState([]);
  const [barberoId, setBarberoId] = useState(barberoInicial?.id || barberoInicial?.barberoId || null);
  const [productos, setProductos] = useState([]);

  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("Retiro de caja");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  const [productoId, setProductoId] = useState(null);
  const [cantidad, setCantidad] = useState("1");
  const [montoConsumo, setMontoConsumo] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBarberos().then(setBarberos).catch(() => {});
    getProductos().then(setProductos).catch(() => {});
  }, []);

  const producto = productos.find((p) => p.id === productoId);

  async function confirmar() {
    setError(null);
    if (!barberoId) return setError("Elige el barbero.");

    try {
      setEnviando(true);
      if (tipo === "retiro") {
        if (!Number(monto) || Number(monto) <= 0) { setEnviando(false); return setError("El monto debe ser mayor a 0."); }
        await registrarRetiroBarbero({ barberoId, monto: Number(monto), concepto: concepto.trim() || "Retiro de caja", metodoPago });
      } else {
        if (!productoId) { setEnviando(false); return setError("Elige el producto."); }
        if (!Number(cantidad) || Number(cantidad) <= 0) { setEnviando(false); return setError("La cantidad debe ser mayor a 0."); }
        if (montoConsumo === "" || Number(montoConsumo) < 0) { setEnviando(false); return setError("Escribe el monto (puede ser 0 si se lo regalan)."); }
        await registrarConsumoBarbero({ barberoId, productoId, cantidad: Number(cantidad), monto: Number(montoConsumo) });
      }
      onRegistrado();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo registrar.");
    } finally {
      setEnviando(false);
    }
  }

  const puedeConfirmar =
    barberoId && (tipo === "retiro" ? Number(monto) > 0 : productoId && Number(cantidad) > 0 && montoConsumo !== "");

  return (
    <Modal titulo="Retiro o consumo de barbero" onClose={onClose}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Barbero</p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {barberos.map((b) => (
          <button
            key={b.id}
            onClick={() => setBarberoId(b.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 ${
              barberoId === b.id ? "border-slate-800 bg-slate-50 shadow-sm dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-900 text-xs font-bold text-white">
              {iniciales(b.nombre)}
            </span>
            <span className="text-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">{b.nombre}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTipo("retiro")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition ${
            tipo === "retiro" ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300" : "border-slate-200 text-slate-500 dark:border-slate-700"
          }`}
        >
          <Wallet size={16} /> Retiro de caja
        </button>
        <button
          onClick={() => setTipo("consumo")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition ${
            tipo === "consumo" ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300" : "border-slate-200 text-slate-500 dark:border-slate-700"
          }`}
        >
          <Package size={16} /> Consumo de producto
        </button>
      </div>

      {tipo === "retiro" ? (
        <div className="paso-in">
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
            Esto sale de la caja HOY (crea un egreso real) y además queda pendiente de descontar.
          </p>
          <label className="mb-1 block text-sm text-slate-600">Monto retirado</label>
          <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="campo mb-3" autoFocus />

          <label className="mb-1 block text-sm text-slate-600">Motivo (opcional)</label>
          <input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Retiro de caja" className="campo mb-3" />

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">¿En qué salió?</p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {METODOS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMetodoPago(m.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 ${
                  metodoPago === m.value ? "border-slate-800 bg-slate-50 shadow-sm dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br ${m.tile} text-white`}>
                  <m.Icono size={16} />
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="paso-in">
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            No sale efectivo hoy (no paga en el momento) — solo se descuenta el producto del inventario.
          </p>
          <label className="mb-1 block text-sm text-slate-600">Producto</label>
          <select value={productoId ?? ""} onChange={(e) => setProductoId(Number(e.target.value) || null)} className="campo mb-3">
            <option value="">Selecciona...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} · {p.stock} en stock</option>
            ))}
          </select>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Cantidad</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="1" className="campo" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Monto a descontarle</label>
              <input type="number" value={montoConsumo} onChange={(e) => setMontoConsumo(e.target.value)} placeholder="0" className="campo" />
            </div>
          </div>
          {producto && <p className="mb-4 text-xs text-slate-400">Precio normal de venta como referencia: {formatoPesos(producto.precioVenta || 0)}</p>}
        </div>
      )}

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={confirmar}
        disabled={enviando || !puedeConfirmar}
        className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <Check size={16} /> {enviando ? "Guardando..." : "Registrar"}
      </button>
    </Modal>
  );
}