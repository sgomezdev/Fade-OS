import { X } from "lucide-react";

export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="ghost-in scroll-fino max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{titulo}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}