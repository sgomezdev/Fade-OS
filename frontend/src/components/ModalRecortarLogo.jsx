import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X, ZoomIn } from "lucide-react";

const VISOR = 280;   // tamaño del recuadro visible en pantalla (px)
const SALIDA = 480;  // resolución del logo final (px) — más nítido que el visor

export default function ModalRecortarLogo({ archivo, onCancelar, onConfirmar }) {
  const [urlOriginal, setUrlOriginal] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const arrastrando = useRef(false);
  const inicio = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    setUrlOriginal(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  // Escala base: la imagen cubre TODO el recuadro (como background-size: cover)
  const escalaBase = natural.w > 0 ? Math.max(VISOR / natural.w, VISOR / natural.h) : 1;
  const escala = escalaBase * zoom;
  const anchoImg = natural.w * escala;
  const altoImg = natural.h * escala;

  const limitar = useCallback(
    (x, y) => {
      const minX = Math.min(0, VISOR - anchoImg);
      const minY = Math.min(0, VISOR - altoImg);
      return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
    },
    [anchoImg, altoImg]
  );

  function alCargarImagen() {
    const img = imgRef.current;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const eb = Math.max(VISOR / img.naturalWidth, VISOR / img.naturalHeight);
    setOffset({ x: (VISOR - img.naturalWidth * eb) / 2, y: (VISOR - img.naturalHeight * eb) / 2 });
  }

  function iniciarArrastre(e) {
    arrastrando.current = true;
    const punto = e.touches ? e.touches[0] : e;
    inicio.current = { px: punto.clientX, py: punto.clientY, ox: offset.x, oy: offset.y };
  }
  function moverArrastre(e) {
    if (!arrastrando.current) return;
    const punto = e.touches ? e.touches[0] : e;
    const dx = punto.clientX - inicio.current.px;
    const dy = punto.clientY - inicio.current.py;
    setOffset(limitar(inicio.current.ox + dx, inicio.current.oy + dy));
  }
  function terminarArrastre() {
    arrastrando.current = false;
  }

  function cambiarZoom(nuevoZoom) {
    setZoom(nuevoZoom);
    const eb = escalaBase * nuevoZoom;
    const aw = natural.w * eb;
    const ah = natural.h * eb;
    const minX = Math.min(0, VISOR - aw);
    const minY = Math.min(0, VISOR - ah);
    setOffset((o) => ({ x: Math.min(0, Math.max(minX, o.x)), y: Math.min(0, Math.max(minY, o.y)) }));
  }

  function confirmar() {
    const k = SALIDA / VISOR;
    const canvas = document.createElement("canvas");
    canvas.width = SALIDA;
    canvas.height = SALIDA;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgRef.current, offset.x * k, offset.y * k, anchoImg * k, altoImg * k);
    canvas.toBlob(
      (blob) => {
        const archivoRecortado = new File([blob], "logo.png", { type: "image/png" });
        onConfirmar(archivoRecortado);
      },
      "image/png",
      0.95
    );
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onCancelar}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ajustar logo</h2>
          <button onClick={onCancelar} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 text-xs text-slate-400">Arrastra la imagen para moverla y usa el control para acercar o alejar.</p>

        <div
          className="relative mx-auto overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 dark:border-slate-700"
          style={{ width: VISOR, height: VISOR, touchAction: "none", cursor: "grab" }}
          onMouseDown={iniciarArrastre}
          onMouseMove={moverArrastre}
          onMouseUp={terminarArrastre}
          onMouseLeave={terminarArrastre}
          onTouchStart={iniciarArrastre}
          onTouchMove={moverArrastre}
          onTouchEnd={terminarArrastre}
        >
          {urlOriginal && (
            <img
              ref={imgRef}
              src={urlOriginal}
              alt=""
              draggable={false}
              onLoad={alCargarImagen}
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: anchoImg || "auto",
                height: altoImg || "auto",
                maxWidth: "none",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn size={16} className="text-slate-400" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => cambiarZoom(Number(e.target.value))}
            className="flex-1 accent-slate-800"
          />
        </div>

        <button
          onClick={confirmar}
          className="shine mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-slate-700 to-slate-950 py-2.5 font-medium text-white transition hover:opacity-90"
        >
          <Check size={16} /> Usar esta imagen
        </button>
      </div>
    </div>
  );
}