// Mientras haya al menos una pantalla cargando, el overlay de App.jsx se mantiene visible.
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const CargaContext = createContext({ registrar: () => {}, hayCargasActivas: false });

export function CargaProvider({ children }) {
  const [contador, setContador] = useState(0);
  const registrar = useCallback((activo) => {
    setContador((c) => Math.max(0, c + (activo ? 1 : -1)));
  }, []);
  return (
    <CargaContext.Provider value={{ registrar, hayCargasActivas: contador > 0 }}>
      {children}
    </CargaContext.Provider>
  );
}

export function useCargaGlobal(cargando) {
  const { registrar } = useContext(CargaContext);
  const previo = useRef(false);

  useEffect(() => {
    if (cargando !== previo.current) {
      registrar(cargando);
      previo.current = cargando;
    }
  }, [cargando, registrar]);

  useEffect(() => () => {
    if (previo.current) registrar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useHayCargasActivas() {
  return useContext(CargaContext).hayCargasActivas;
}