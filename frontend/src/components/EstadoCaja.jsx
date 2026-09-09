export default function EstadoCaja({ sesion }) {
  const abierta = sesion?.estado === "ABIERTA";
  const cerrada = sesion?.estado === "CERRADA";

  const cfg = abierta
    ? { dot: "bg-emerald-500", ping: "bg-emerald-400", texto: "Caja abierta", color: "text-emerald-700 dark:text-emerald-300" }
    : cerrada
    ? { dot: "bg-slate-400", ping: null, texto: "Caja cerrada", color: "text-slate-500" }
    : { dot: "bg-amber-500", ping: null, texto: "Caja sin abrir", color: "text-amber-700 dark:text-amber-300" };

  return (
    <div className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 shadow-md shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <span className="relative flex h-2.5 w-2.5">
        {cfg.ping && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.ping} opacity-75`} />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
      </span>
      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.texto}</span>
    </div>
  );
}