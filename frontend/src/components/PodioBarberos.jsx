import { Crown } from "lucide-react";
import { formatoPesos } from "../lib/format";
import NumeroAnimado from "./NumeroAnimado";

function iniciales(nombre) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const ESTILOS = {
  1: {
    tinte: "bg-amber-400/15 border-amber-300/50 dark:bg-amber-400/10 dark:border-amber-300/30",
    avatar: "bg-gradient-to-br from-amber-300 to-amber-600 avatar-oro",
    texto: "text-amber-900 dark:text-amber-200",
    sub: "text-amber-700/80 dark:text-amber-300/70",
    alto: "h-40",
  },
  2: {
    tinte: "bg-slate-400/15 border-slate-300/50 dark:bg-white/10 dark:border-white/20",
    avatar: "bg-gradient-to-br from-slate-300 to-slate-500 avatar-plata",
    texto: "text-slate-700 dark:text-slate-100",
    sub: "text-slate-500 dark:text-slate-300/80",
    alto: "h-28",
  },
  3: {
    tinte: "bg-orange-700/10 border-orange-500/40 dark:bg-orange-500/10 dark:border-orange-400/30",
    avatar: "bg-gradient-to-br from-orange-400 to-orange-800 avatar-bronce",
    texto: "text-orange-900 dark:text-orange-200",
    sub: "text-orange-700/70 dark:text-orange-300/70",
    alto: "h-20",
  },
};

function Columna({ puesto, barbero }) {
  if (!barbero) return <div className="w-28" />;
  const est = ESTILOS[puesto];
  return (
    <div className="flex w-28 flex-col items-center sm:w-32">
      <div className="relative mb-1">
        {puesto === 1 && (
          <Crown
            size={34}
            strokeWidth={1.5}
            className="corona-brillo absolute -top-9 left-1/2 -translate-x-1/2 -rotate-6 text-amber-500"
            fill="#fbbf24"
          />
        )}
        <span className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${est.avatar}`}>
          {iniciales(barbero.nombre)}
        </span>
      </div>
      <div className={`liquid-glass flex w-full flex-col items-center justify-end rounded-t-2xl border px-2 pb-3 pt-4 ${est.tinte} ${est.alto}`}>
        <span className={`text-xs font-black ${est.texto}`}>#{puesto}</span>
        <span className={`mt-1 text-center text-xs font-bold leading-tight ${est.texto}`}>{barbero.nombre}</span>
                <NumeroAnimado valor={barbero.producido} className={`mt-0.5 text-xs font-black ${est.sub}`} />
      </div>
    </div>
  );
}

export default function PodioBarberos({ ranking }) {
  const [primero, segundo, tercero] = ranking;

  return (
    <div className="flex items-end justify-center gap-2 pt-8 sm:gap-4">
      <Columna puesto={2} barbero={segundo} />
      <Columna puesto={1} barbero={primero} />
      <Columna puesto={3} barbero={tercero} />
    </div>
  );
}