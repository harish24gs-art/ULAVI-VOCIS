import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  const isError = toast?.type === "error";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          className={`fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_70px_rgba(17,46,129,0.22)] backdrop-blur-xl ${
            isError ? "border-red-300/35 bg-[#7F1D1D]/95 text-white" : "border-[#00C68D]/35 bg-[#112E81]/96 text-white"
          }`}
        >
          {isError ? <TriangleAlert size={18} className="text-red-200" /> : <CheckCircle2 size={18} className="text-[#00C68D]" />}
          <span>{toast.message}</span>
          <button onClick={onClose} className="rounded-md p-1 text-white/60 hover:text-white" aria-label="Close notification">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
