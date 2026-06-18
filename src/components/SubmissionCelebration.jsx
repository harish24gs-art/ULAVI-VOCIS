import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import BrandMark from "./BrandMark.jsx";

const butterflies = ["🦋", "✦", "🦋", "✧", "🦋", "✦"];

export default function SubmissionCelebration({ open }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-[#020713]/86 px-4 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {butterflies.map((item, index) => (
          <motion.span
            key={`${item}-${index}`}
            initial={{ opacity: 0, y: 40, x: 0, scale: 0.7 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              y: [-10, -80, -150, -220],
              x: [0, index % 2 ? 42 : -42, index % 3 ? 84 : -84],
              scale: [0.8, 1.1, 1, 0.85]
            }}
            transition={{ duration: 1.8, delay: index * 0.12, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 text-3xl"
          >
            {item}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-emerald-300/25 bg-[#071326]/96 p-8 text-center shadow-[0_28px_110px_rgba(34,197,94,0.24)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.28),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.24),transparent_42%)]" />
        <div className="relative">
          <div className="mx-auto mb-6 w-fit">
            <BrandMark />
          </div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-emerald-200/40 bg-emerald-400/16 text-emerald-200 shadow-[0_0_50px_rgba(52,211,153,0.45)]">
            <CheckCircle2 size={42} />
          </div>
          <div className="mt-6 rounded-2xl bg-white/90 px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <h2 className="text-3xl font-black text-[#112E81]">
              Request submitted successfully
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-[#212529]">
              Your details are confirmed. Preparing your success page now.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
