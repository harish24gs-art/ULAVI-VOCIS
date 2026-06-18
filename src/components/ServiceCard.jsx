import { motion } from "framer-motion";

export default function ServiceCard({ icon: Icon, title, body, active = false, compact = false, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`group rounded-2xl border bg-white text-left shadow-sm transition hover:border-blue-200 hover:shadow-md ${
        compact ? "p-4" : "p-5"
      } ${active ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"}`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={21} strokeWidth={1.9} />
      </div>
      <h3 className="whitespace-pre-line text-base font-bold leading-tight text-slate-950">{title}</h3>
      {!compact && <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>}
    </motion.button>
  );
}
