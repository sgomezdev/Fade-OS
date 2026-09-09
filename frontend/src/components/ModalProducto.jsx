import { useState } from "react";
import { ChevronLeft, Plus, Check } from "lucide-react";
import Modal from "./Modal";
import { formatoPesos } from "../lib/format";
import { Botella, Spray } from "./iconos";

const pasos = ["Producto", "Precios", "Confirmar"];

const COLORES = [
  { valor: null, etiqueta: "Ninguno", clase: "bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600" },
  { valor: "GOLD", etiqueta: "Dorado", clase: "bg-gradient-to-br from-amber-300 to-amber-600 border-amber-400" },
  { valor: "SILVER", etiqueta: "Plateado", clase: "bg-gradient-to-br from-slate-200 to-slate-400 border-slate-400" },
  { valor: "BLACK", etiqueta: "Negro metalizado", clase: "bg-gradient-to-br from-slate-700 to-slate-950 border-slate-600" },
];

function iconoCategoria(categoria) {
  return categoria === "CAPILAR"
    ? { Icono: Spray, gradient: "from-violet-400 to-violet-600" }
    : { Icono: Botella, gradient: "from-amber-400 to-amber-600" };
}

export default function ModalProducto({ producto, categoria, onClose, onGuardar, guardando, error }) {
  const editando = !!producto;
  const categoriaActual = producto?.categoria || categoria;
  const etiquetaCategoria = categoriaActual === "CAPILAR" ? "capilar" : "bebida";
  const { Icono, gradient } = iconoCategoria(categoriaActual);

  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [imagen, setImagen] = useState(producto?.imagen || "");
  const [imagenRota, setImagenRota] = useState(false);
  const [color, setColor] = useState(producto?.color || null);
  const [stock, setStock] = useState(producto ? String(producto.stock) : "0");
  const [stockMinimo, setStockMinimo] = useState(producto ? String(producto.stockMinimo ?? 2) : "2");
  const [costo, setCosto] = useState(producto ? String(producto.costo) : "");
  const [precioVenta, setPrecioVenta] = useState(producto ? String(producto.precioVenta) : "");
  const [paso, setPaso] = useState(1);

  const margen = (Number(precioVenta) || 0) - (Number(costo) || 0);
  const esColorLibre = typeof color === "string" && color.startsWith("#");
  const puedeAvanzarPaso1 = nombre.trim().length > 0;
  const puedeAvanzarPaso2 = costo !== "" && precioVenta !== "";

  function siguiente() {
    if (paso === 1 && puedeAvanzarPaso1) setPaso(2);
    else if (paso === 2 && puedeAvanzarPaso2) setPaso(3);
  }
  function atras() {
    if (paso > 1) setPaso(paso - 1);
  }

  function guardar() {
    onGuardar({
      nombre: nombre.trim(),
      categoria: categoriaActual,
      imagen: imagen.trim() || null,
      color,
      stock: Number(stock) || 0,
      stockMinimo: Number(stockMinimo) || 0,
      costo: Number(costo) || 0,
      precioVenta: Number(precioVenta) || 0,
    });
  }

  return (
    <Modal titulo={editando ? "Editar producto" : `Nuevo producto (${etiquetaCategoria})`} onClose={onClose}>
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

      {paso > 1 && (
        <button onClick={atras} className="mb-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ChevronLeft size={16} /> Atrás
        </button>
      )}

      {paso === 1 && (
        <div key="p1" className="paso-in">
          <div className="mb-4 flex justify-center">
            <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br ${gradient} text-white shadow-sm`}>
              {imagen && !imagenRota ? (
                <img src={imagen} alt="" className="h-full w-full object-contain bg-white" onError={() => setImagenRota(true)} onLoad={() => setImagenRota(false)} />
              ) : (
                <Icono size={36} />
              )}
            </div>
          </div>

          <label className="mb-1 block text-sm text-slate-600">Nombre del producto</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={etiquetaCategoria === "capilar" ? "Ej: Cera Gold" : "Ej: Stella Artois"} className="campo mb-3" autoFocus />

          <label className="mb-1 block text-sm text-slate-600">Imagen (URL o ruta, opcional)</label>
          <input
            value={imagen}
            onChange={(e) => { setImagen(e.target.value); setImagenRota(false); }}
            placeholder="/img/producto.png o https://..."
            className="campo mb-4"
          />

          <label className="mb-2 block text-sm text-slate-600">Color especial (opcional)</label>
          <div className="flex items-center gap-3">
            {COLORES.map((c) => (
              <button
                key={c.etiqueta}
                type="button"
                onClick={() => setColor(c.valor)}
                title={c.etiqueta}
                className={`h-10 w-10 rounded-full border-2 transition ${c.clase} ${color === c.valor ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900" : ""}`}
              />
            ))}

            {/* Separador visual antes de la rueda de color libre */}
            <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

            {/* Rueda de color normal, para quien prefiera un color liso en vez de metalizado */}
            <label
              title="Elegir un color personalizado"
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition ${
                esColorLibre ? "border-white ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900" : "border-slate-300 dark:border-slate-600"
              }`}
              style={{ background: esColorLibre ? color : "conic-gradient(from 90deg, #f87171, #fbbf24, #34d399, #38bdf8, #a78bfa, #f87171)" }}
            >
              <input
                type="color"
                value={esColorLibre ? color : "#64748b"}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-400">Los tres primeros dan un brillo metalizado animado en Inicio; la rueda es un color liso normal.</p>
          {imagen && imagenRota && <p className="mt-2 text-xs text-rose-500">No se pudo cargar esa imagen — revisa el link o la ruta.</p>}

          <button onClick={siguiente} disabled={!puedeAvanzarPaso1} className="shine mt-5 w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-40">
            Siguiente
          </button>
        </div>
      )}

      {paso === 2 && (
        <div key="p2" className="paso-in">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Stock inicial</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="campo" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Alertar si baja de</label>
              <input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} placeholder="2" className="campo" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Precio de costo</label>
              <input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0" className="campo" autoFocus />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Precio de venta</label>
              <input type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="0" className="campo" />
            </div>
          </div>

          {(costo !== "" || precioVenta !== "") && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Margen por unidad</span>
              <span className={`text-lg font-bold ${margen >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatoPesos(margen)}</span>
            </div>
          )}

          <button onClick={siguiente} disabled={!puedeAvanzarPaso2} className="shine w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-40">
            Siguiente
          </button>
        </div>
      )}

      {paso === 3 && (
        <div key="p3" className="paso-in">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${gradient} text-white`}>
              {imagen && !imagenRota ? <img src={imagen} alt="" className="h-full w-full object-contain bg-white" /> : <Icono size={24} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-slate-800 dark:text-slate-100">{nombre}</p>
              <p className="text-xs text-slate-400">{stock} en stock · alerta bajo {stockMinimo}</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-100 px-2 py-3 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Costo</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatoPesos(Number(costo) || 0)}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-2 py-3 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Venta</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatoPesos(Number(precioVenta) || 0)}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-2 py-3 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Margen</p>
              <p className={`text-sm font-bold ${margen >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatoPesos(margen)}</p>
            </div>
          </div>

          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button onClick={guardar} disabled={guardando} className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50">
            {!editando && <Plus size={16} />}
            {editando && <Check size={16} />}
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      )}
    </Modal>
  );
}