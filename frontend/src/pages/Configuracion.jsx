// Configuración del negocio: nombre y logo, con recorte/ajuste antes de guardar.
import { useState, useEffect, useRef } from "react";
import { Check, Upload } from "lucide-react";
import { actualizarNegocio, subirLogoNegocio, urlArchivo } from "../lib/api";
import { useNegocio } from "../lib/NegocioContext";
import { Tijeras } from "../components/iconos";
import ModalRecortarLogo from "../components/ModalRecortarLogo";
import { useCargaGlobal } from "../lib/CargaContext";


export default function Configuracion() {
  const { nombre, logo, colorAcento, mostrarGastosFijos, cargando, recargar } = useNegocio();
  useCargaGlobal(cargando);
  const [nombreForm, setNombreForm] = useState("");
  const [archivoParaRecortar, setArchivoParaRecortar] = useState(null);
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logoRota, setLogoRota] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState(null);
  const [gastosFijosForm, setGastosFijosForm] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!cargando) {
      setNombreForm(nombre || "");
      setGastosFijosForm(!!mostrarGastosFijos);
    }
  }, [cargando, nombre, mostrarGastosFijos]);

  useEffect(() => {
    if (!archivoLogo) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(archivoLogo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [archivoLogo]);

  function elegirArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Selecciona un archivo de imagen.");
    if (file.size > 8 * 1024 * 1024) return setError("La imagen no puede pesar más de 8 MB.");
    setError(null);
    setArchivoParaRecortar(file);
  }

  function alConfirmarRecorte(archivoRecortado) {
    setLogoRota(false);
    setArchivoLogo(archivoRecortado);
    setArchivoParaRecortar(null);
  }

  async function guardar() {
    setError(null);
    setGuardado(false);
    if (!nombreForm.trim()) return setError("El nombre no puede quedar vacío.");
    try {
      setGuardando(true);
      if (archivoLogo) await subirLogoNegocio(archivoLogo);
            await actualizarNegocio({ nombre: nombreForm.trim(), colorAcento, mostrarGastosFijos: gastosFijosForm });
      recargar();
      setArchivoLogo(null);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const imagenAMostrar = previewUrl || (logo && !logoRota ? urlArchivo(logo) : null);

  return (
    <div className="mx-auto max-w-xl space-y-6 ">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">FadeOS</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">CONFIGURACION</h1>
        <p className="mt-1 text-sm text-slate-500">Aqui puedes ver todas las opciones disponibles.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-700 to-slate-950 text-white">
            {imagenAMostrar ? (
              <img src={imagenAMostrar} alt="" className="h-full w-full object-cover" onError={() => setLogoRota(true)} />
            ) : (
              <Tijeras size={28} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">Logo del negocio</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="shine mt-1 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
            >
              <Upload size={13} /> Seleccionar archivo
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={elegirArchivo} className="hidden" />
            {archivoLogo && <p className="mt-1 text-xs text-emerald-600">Logo ajustado, sin guardar todavía</p>}
          </div>
        </div>

        <label className="mb-1 block text-sm text-slate-600">Nombre del negocio</label>
        <input value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} placeholder="Ej: Manhattan Barbershop" className="campo" />

        <label className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gastos fijos</p>
            <p className="text-xs text-slate-400">Arriendo, sueldo del administrador, servicios, etc.</p>
          </div>
          <input
            type="checkbox"
            checked={gastosFijosForm}
            onChange={(e) => setGastosFijosForm(e.target.checked)}
            className="h-5 w-5 accent-slate-800"
          />
        </label>

        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <button
          onClick={guardar}
          disabled={guardando}
          className="shine mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {guardado ? <Check size={16} /> : null}
          {guardando ? "Guardando..." : guardado ? "Guardado" : "Guardar cambios"}
        </button>
      </div>

      <p className="text-center text-xs text-slate-300">FadeOS · Sistema de caja y control para barberías</p>

      {archivoParaRecortar && (
        <ModalRecortarLogo
          archivo={archivoParaRecortar}
          onCancelar={() => setArchivoParaRecortar(null)}
          onConfirmar={alConfirmarRecorte}
        />
      )}
    </div>
  );
}