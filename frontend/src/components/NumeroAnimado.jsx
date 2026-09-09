import { useState, useEffect, useRef } from "react";
import { formatoPesos } from "../lib/format";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function NumeroAnimado({ valor, duracion = 700, formatear = formatoPesos, className = "" }) {
  const [mostrado, setMostrado] = useState(0);
  const desdeRef = useRef(0);
  const inicioRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    desdeRef.current = mostrado;
    inicioRef.current = null;
    cancelAnimationFrame(rafRef.current);

    function paso(timestamp) {
      if (!inicioRef.current) inicioRef.current = timestamp;
      const progreso = Math.min((timestamp - inicioRef.current) / duracion, 1);
      const actual = desdeRef.current + (valor - desdeRef.current) * easeOutCubic(progreso);
      setMostrado(actual);
      if (progreso < 1) rafRef.current = requestAnimationFrame(paso);
    }
    rafRef.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return <span className={className}>{formatear(Math.round(mostrado))}</span>;
}