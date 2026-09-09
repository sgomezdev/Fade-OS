import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, TriangleAlert, Minus, PackagePlus } from "lucide-react";
import { getProductos, crearProducto, actualizarProducto, ajustarStock, eliminarProducto, reponerProducto } from "../lib/api";
import { formatoPesos } from "../lib/format";
import { Botella, Spray } from "../components/iconos";
import ModalProducto from "../components/ModalProducto";
import ModalReponer from "../components/ModalReponer";
import { useCargaGlobal } from "../lib/CargaContext";



function iconoCategoria(categoria) {
  return categoria === "CAPILAR"
    ? { Icono: Spray, gradient: "from-violet-400 to-violet-600" }
    : { Icono: Botella, gradient: "from-amber-400 to-amber-600" };
}

const CATEGORIAS = [
  { valor: "BEBIDA", etiqueta: "Bebidas", icono: Botella },
  { valor: "CAPILAR", etiqueta: "Capilares", icono: Spray },
];

export default function Inventario({ categoria, setCategoria }) {
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useCargaGlobal(cargando);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalReponer, setModalReponer] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setTodos(await getProductos());
      setError(null);
    } catch (e) {
      setError("No se pudo cargar el inventario. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const productos = todos.filter((p) => p.categoria === categoria);
  const etiquetaActual = CATEGORIAS.find((c) => c.valor === categoria)?.etiqueta || "Productos";
  const { Icono: IconoCat, gradient: gradientCat } = iconoCategoria(categoria);

  async function guardarProducto(datos) {
    setErrorModal(null);
    setGuardando(true);
    try {
      if (modal !== "nuevo") await actualizarProducto(modal.id, datos);
      else await crearProducto(datos);
      setModal(null);
      cargar();
    } catch (e) {
      setErrorModal(e.response?.data?.error || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarReponer(productoId, cantidad, totalPagado, metodoPago) {
    setErrorModal(null);
    setGuardando(true);
    try {
      await reponerProducto(productoId, cantidad, totalPagado, metodoPago);
      setModalReponer(false);
      cargar();
    } catch (e) {
      setErrorModal(e.response?.data?.error || "No se pudo registrar el pedido.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarStock(producto, delta) {
    try {
      await ajustarStock(producto.id, delta);
      cargar();
    } catch (e) {
      alert(e.response?.data?.error || "No se pudo ajustar el stock.");
    }
  }

  async function eliminar(producto) {
    if (!window.confirm(`¿Quitar "${producto.nombre}" del inventario?`)) return;
    try { await eliminarProducto(producto.id); cargar(); } catch (e) { alert("No se pudo eliminar."); }
  }

  const bajos = productos.filter((p) => p.stock <= (p.stockMinimo ?? 2));
  const valorInventario = productos.reduce((s, p) => s + p.stock * p.costo, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Manhattan · Caja</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{etiquetaActual}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalReponer(true)}
            className="shine flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <PackagePlus size={16} /> Nuevo pedido
          </button>
          <button
            onClick={() => setModal("nuevo")}
            className="shine flex items-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={16} /> Agregar producto
          </button>
        </div>
      </div>

      {/* Pestañas de categoría (también disponibles aquí, además del desplegable del sidebar) */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5" style={{ width: "fit-content" }}>
        {CATEGORIAS.map((c) => {
          const Icono = c.icono;
          const activa = categoria === c.valor;
          return (
            <button
              key={c.valor}
              onClick={() => setCategoria(c.valor)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activa ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icono size={15} /> {c.etiqueta}
            </button>
          );
        })}
      </div>

      {cargando ? (
        <p className="text-slate-500">Cargando...</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-slate-950 p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -bottom-6 -right-4 text-white/5"><IconoCat size={140} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Valor del inventario (a costo)</p>
            <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatoPesos(valorInventario)}</p>
            <p className="mt-3 text-sm text-white/60">{productos.length} producto{productos.length !== 1 && "s"} en {etiquetaActual.toLowerCase()}</p>
          </div>

          {bajos.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <TriangleAlert size={18} className="mt-0.5 shrink-0" />
              <p><b>Stock bajo:</b> {bajos.map((p) => p.nombre).join(", ")}. Es hora de reponer.</p>
            </div>
          )}

          {productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><IconoCat size={26} /></span>
              <p className="text-slate-400">Aún no has agregado {etiquetaActual.toLowerCase()}.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => {
                const bajo = p.stock <= (p.stockMinimo ?? 2);
                const agotado = p.stock === 0;
                const margen = p.precioVenta - p.costo;
                return (
                  <div key={p.id} className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${gradientCat} text-white`}>
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt=""
                              className="h-full w-full object-contain bg-white"
                              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                            />
                          ) : null}
                          <span style={{ display: p.imagen ? "none" : "flex" }} className="h-full w-full items-center justify-center">
                            <IconoCat size={20} />
                          </span>
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{p.nombre}</p>
                          <p className="text-xs text-slate-400">{formatoPesos(p.precioVenta)} venta</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        <button onClick={() => setModal(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={14} /></button>
                        <button onClick={() => eliminar(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 ${agotado ? "bg-rose-50" : bajo ? "bg-amber-50" : "bg-slate-50"}`}>
                      <span className={`text-xs font-bold uppercase tracking-wide ${agotado ? "text-rose-500" : bajo ? "text-amber-600" : "text-slate-400"}`}>
                        {agotado ? "Agotado" : bajo ? "Stock bajo" : "Stock"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => cambiarStock(p, -1)} disabled={p.stock <= 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-800 disabled:opacity-30">
                          <Minus size={13} />
                        </button>
                        <span className={`w-6 text-center text-lg font-black ${agotado ? "text-rose-600" : bajo ? "text-amber-700" : "text-slate-900"}`}>{p.stock}</span>
                        <button onClick={() => cambiarStock(p, 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-800">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Costo {formatoPesos(p.costo)}</span>
                      <span className={margen >= 0 ? "text-emerald-600" : "text-rose-600"}>Margen {formatoPesos(margen)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {modal && (
        <ModalProducto
          producto={modal === "nuevo" ? null : modal}
          categoria={categoria}
          onClose={() => setModal(null)}
          onGuardar={guardarProducto}
          guardando={guardando}
          error={errorModal}
        />
      )}

      {modalReponer && (
        <ModalReponer
          productos={productos}
          categoria={categoria}
          onClose={() => setModalReponer(false)}
          onConfirmar={confirmarReponer}
          guardando={guardando}
          error={errorModal}
        />
      )}
    </div>
  );
}