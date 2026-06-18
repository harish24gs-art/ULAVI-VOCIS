import { CarFront, Lock } from "lucide-react";

const labels = {
  serviceType: "Service Type",
  language: "Language",
  name: "Contact Name",
  email: "Email",
  phone: "Contact Information",
  pickup: "Pickup Location",
  dropoff: "Dropoff Location",
  date: "Date",
  time: "Time",
  passengers: "Passengers",
  equipment: "Medical Equipment",
  packageHours: "Package Hours",
  notes: "Notes"
};

export default function SummaryPanel({ draft, missingFields = [], requiredFields = [], onReview, onEdit }) {
  const hasService = Boolean(String(draft.serviceType || "").trim());
  const orderedKeys = hasService
    ? (requiredFields.length ? requiredFields : Object.keys(draft).filter((key) => key !== "language" && draft[key]))
    : [];
  const total = hasService ? Math.max(orderedKeys.length, 1) : 0;
  const filled = orderedKeys.filter((key) => String(draft[key] || "").trim()).length;
  const percent = total ? Math.round((filled / total) * 100) : 0;
  const nextField = missingFields[0] ? labels[missingFields[0]] || missingFields[0] : "";

  return (
    <aside className="rounded-[24px] border border-[#112E81]/10 bg-white p-4 text-[#212529] shadow-[0_24px_70px_rgba(17,46,129,0.1)]">
      <h2 className="text-lg font-black text-[#112E81]">Booking Progress</h2>

      <div className="mt-4 rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#00C68D]/12 text-[#007B61]">
            <CarFront size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[#64748B]">Service Type</div>
            <div className="truncate text-base font-black text-[#112E81]">{draft.serviceType || "Not selected"}</div>
          </div>
          <button
            type="button"
            onClick={() => onEdit?.("serviceType")}
            className="rounded-xl border border-[#0066DA]/20 bg-white px-3 py-2 text-xs font-bold text-[#0066DA] hover:bg-[#EEF6FF]"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-[#475569]">Progress</span>
          <span className="font-bold text-[#112E81]">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#00C68D,#0066DA)] transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">Details Collected</div>
        <div className="mt-2 text-3xl font-black text-[#112E81]">{filled} / {total || 0}</div>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          {hasService
            ? nextField
              ? `Next: ${nextField}`
              : "All required details are ready."
            : "Choose a service to begin."}
        </p>
      </div>

      {missingFields.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#00C68D]/20 bg-[#00C68D]/8 p-3 text-sm leading-6 text-[#0F766E]">
          Keep talking. Vocis will ask one simple question at a time.
        </div>
      )}

      <button
        onClick={onReview}
        disabled={!hasService || percent < 100}
        className="mt-6 w-full rounded-2xl bg-[#0066DA] px-5 py-4 text-base font-bold text-white shadow-[0_12px_28px_rgba(0,102,218,0.18)] transition hover:bg-[#112E81] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Review Details
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#64748B]">
        <Lock size={14} />
        Secure • Private • Encrypted
      </div>
    </aside>
  );
}
