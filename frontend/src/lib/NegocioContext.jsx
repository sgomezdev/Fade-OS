import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNegocio } from "./api";

const NegocioContext = createContext({
  nombre: "Mi Barbería",
  logo: null,
  cargando: true,
  recargar: () => {},
});

export function NegocioProvider({ children }) {
  const [negocio, setNegocio] = useState({ nombre: "Mi Barbería", logo: null, colorAcento: null });
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    setCargando(true);
    getNegocio()
      .then(setNegocio)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  useEffect(() => {
    if (!cargando && negocio.nombre) {
      document.title = `${negocio.nombre} · FadeOS`;
    }
  }, [cargando, negocio.nombre]);

  return (
    <NegocioContext.Provider value={{ ...negocio, cargando, recargar }}>
      {children}
    </NegocioContext.Provider>
  );
}

export function useNegocio() {
  return useContext(NegocioContext);
}