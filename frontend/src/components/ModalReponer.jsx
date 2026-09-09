import { useState } from "react";
import { Check, PackagePlus, Banknote, Smartphone, Landmark, MoreHorizontal } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";
import { Botella, Spray } from "./iconos";

function iconoCategoria(categoria) {
  return categoria === "CAPILAR"
    ? { Icono: Spray, gradient: "from-violet-400 to-violet-600" }
    : { Icono: Botella, gradient: "from-amber-400 to-amber-600" };
}

function pacaSugerida(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("stella")) return 24;
  if (n.includes("gatorade")) return 12;
  if (n.includes("modelo")) return 12;
  return 12;
}

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", Icono: Banknote, tile: "from-emerald-400 to-emerald-600", tint: "bg-emerald-500/10 border-emerald-300/50" },
  { value: "NEQUI", label: "Nequi", Icono: Smartphone, tile: "from-fuchsia-500 to-purple-700", tint: "bg-fuchsia-500/10 border-fuchsia-300/50" },
  { value: "TRANSFERENCIA", label: "Bancolombia", Icono: Landmark, tile: "from-amber-300 to-amber-500", tint: "bg-amber-400/10 border-amber-300/50" },
  { value: "OTRO", label: "Otro", Icono: MoreHorizontal, tile: "from-slate-500 to-slate-700", tint: "bg-slate-500/10 border-slate-300/50" },
];

export default function ModalReponer({ productos, categoria, onClose, onConfirmar, guardando, error }) {
  const { Icono: IconoCat, gradient: gradientCat } = iconoCategoria(categoria);
  const [productoId, setProductoId] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [totalPagado, setTotalPagado] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  const producto = productos.find((p) => p.id === productoId);
  const costoUnitario = Number(cantidad) > 0 ? (Number(totalPagado) || 0) / Number(cantidad) : 0;
  const nuevoStock = producto ? producto.stock + (Number(cantidad) || 0) : 0;

  function elegir(p) {
    setProductoId(p.id);
    setCantidad(String(pacaSugerida(p.nombre)));
    setTotalPagado("");
  }

  function confirmar() {
    onConfirmar(productoId, Number(cantidad), Number(totalPagado), metodoPago);
  }

  const puedeConfirmar = producto && Number(cantidad) > 0 && totalPagado !== "" && Number(totalPagado) >= 0;

  return (
    <Modal titulo="Nuevo pedido" onClose={onClose}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">¿Qué llegó?</p>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {productos.map((p) => {
          const activo = productoId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => elegir(p)}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-2 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                activo ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-white/5"
              }`}
            >
              {activo && (
                <span className="glow-check absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <div className="mb-2 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-white">
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                  />
                ) : null}
                <span style={{ display: p.imagen ? "none" : "flex" }} className={`h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${gradientCat} text-white`}>
                  <IconoCat size={20} />
                </span>
              </div>
              <span className="truncate text-center text-xs font-bold text-slate-700 dark:text-slate-200">{p.nombre}</span>
              <span className="text-center text-[10px] text-slate-400">{p.stock} en stock</span>
            </button>
          );
        })}
      </div>

      {producto && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Unidades del pedido</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="24" className="campo" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Total pagado</label>
              <input type="number" value={totalPagado} onChange={(e) => setTotalPagado(e.target.value)} placeholder="0" className="campo" />
            </div>
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">¿Con qué pagaste?</p>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {METODOS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMetodoPago(m.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                  metodoPago === m.value ? "border-slate-800 bg-slate-50 dark:border-white dark:bg-white/10" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${m.tile} text-white`}>
                  <m.Icono size={15} />
                </span>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4 overflow-hidden rounded-xl bg-linear-to-br from-slate-700 to-slate-950 px-4 py-3.5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Costo por unidad</p>
                <p className="text-lg font-bold">{formatoPesos(costoUnitario)}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Nuevo stock</p>
                <p className="text-lg font-bold text-emerald-400">{nuevoStock}</p>
              </div>
            </div>
          </div>

          <p className="mb-3 text-xs text-slate-400">Esto va a quedar registrado como un egreso en Movimientos y afecta el cuadre de Caja.</p>
        </>
      )}

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        onClick={confirmar}
        disabled={guardando || !puedeConfirmar}
        className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Agregar pedido"}
      </button>
    </Modal>
  );
}