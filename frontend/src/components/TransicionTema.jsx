import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function TransicionTema({ x, y, radioFinal, creciendo, onCubierto, onTerminar }) {
  const [fase, setFase] = useState(creciendo ? "creciendo" : "encogiendo");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFase(creciendo ? "creciendo-activo" : "encogiendo-activo"));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fase === "creciendo-activo") {
      const t = setTimeout(() => {
        onCubierto?.();
        setFase("desvaneciendo");
      }, 420);
      return () => clearTimeout(t);
    }
    if (fase === "desvaneciendo") {
      const t = setTimeout(onTerminar, 260);
      return () => clearTimeout(t);
    }
    if (fase === "encogiendo-activo") {
      const t = setTimeout(onTerminar, 420);
      return () => clearTimeout(t);
    }
  }, [fase, onCubierto, onTerminar]);

  const escala =
    fase === "creciendo" ? 0
    : fase === "creciendo-activo" || fase === "desvaneciendo" ? 1
    : fase === "encogiendo" ? 1
    : 0;

  const esDesvanecido = fase === "desvaneciendo";
  const diametro = radioFinal * 2;

  return createPortal(
    <div
      className="pointer-events-none fixed z-20 rounded-full bg-slate-950"
      style={{
        left: x - radioFinal,
        top: y - radioFinal,
        width: diametro,
        height: diametro,
        transform: `scale(${escala})`,
        opacity: esDesvanecido ? 0 : 1,
        willChange: "transform, opacity",
        transition: esDesvanecido
          ? "opacity 260ms ease-out"
          : "transform 420ms cubic-bezier(0.45,0,0.2,1)",
      }}
    />,
    document.body
  );
}