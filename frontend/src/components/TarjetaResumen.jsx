// Tarjeta reutilizable para mostrar una métrica del dashboard.
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

const estilos = {
  verde: { icono: ArrowUpRight, fondo: "bg-emerald-50", texto: "text-emerald-600", borde: "border-emerald-100" },
  rojo:  { icono: ArrowDownRight, fondo: "bg-rose-50", texto: "text-rose-600", borde: "border-rose-100" },
  azul:  { icono: Wallet, fondo: "bg-slate-50", texto: "text-slate-700", borde: "border-slate-200" },
};

export default function TarjetaResumen({ titulo, valor, color = "azul" }) {
  const estilo = estilos[color];
  const Icono = estilo.icono;

  return (
    <div className={`group flex cursor-default items-center gap-4 rounded-2xl border ${estilo.borde} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${estilo.fondo} ${estilo.texto} transition-transform duration-200 group-hover:scale-110`}>
        <Icono size={25} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{titulo}</p>
        <p className="text-2xl font-semibold text-slate-900">{valor}</p>
      </div>
    </div>
  );
}