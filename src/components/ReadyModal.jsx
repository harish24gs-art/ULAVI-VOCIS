import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mic, X } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder.jsx";

const labels = {
  serviceType: "Service",
  language: "Language",
  name: "Name",
  email: "Email",
  phone: "WhatsApp",
  pickup: "Pickup",
  dropoff: "Dropoff",
  date: "Date",
  time: "Time",
  passengers: "Passengers",
  equipment: "Equipment",
  packageHours: "Hours",
  notes: "Notes"
};

export default function ReadyModal({ draft, open, progress, isSubmitting = false, onClose, onReview, onVoiceConfirm }) {
  const entries = Object.entries(draft).filter(([, value]) => value);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 grid place-items-center bg-[#112E81]/24 px-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#112E81]/10 bg-white p-5 shadow-[0_30px_120px_rgba(17,46,129,0.22)] sm:p-7"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl border border-[#112E81]/10 bg-[#F8F9FA] p-2 text-[#64748B] hover:text-[#112E81]"
              aria-label="Close ready details"
            >
              <X size={17} />
            </button>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#00C68D]/12 text-[#00A878]">
              <CheckCircle2 size={28} />
            </div>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.22em] text-[#B98A2F]">
              {progress?.filled || entries.length} / {progress?.total || entries.length} collected
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#112E81]">Details are ready</h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-[#64748B]">
              Vocis has hidden the collection work and prepared a clean lead summary. Review it once before operations receives it.
            </p>
            <div className="mt-5 rounded-2xl border border-[#0066DA]/15 bg-[#EEF6FF] p-4">
              <div className="mb-3 flex items-center gap-3 text-sm font-black text-[#112E81]">
                <Mic size={17} />
                Say yes to confirm and submit, or say what detail to change.
              </div>
              <VoiceRecorder disabled={isSubmitting} onVoice={onVoiceConfirm} variant="review" />
            </div>

            <div className="mt-6 grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {entries.map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-3">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">{labels[key] || key}</div>
                  <div className="mt-1 text-sm font-bold text-[#112E81]">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onReview} className="inline-flex items-center gap-3 rounded-xl bg-[#112E81] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(17,46,129,0.16)] hover:bg-[#0066DA]">
                Review and submit
                <ArrowRight size={17} />
              </button>
              <button onClick={onClose} className="rounded-xl border border-[#112E81]/10 bg-white px-5 py-3 text-sm font-black text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#112E81]">
                Continue editing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
