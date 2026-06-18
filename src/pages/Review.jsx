import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Headphones,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound
} from "lucide-react";
import BrandMark from "../components/BrandMark.jsx";

const serviceIcons = {
  "Airport Transfer": Plane,
  "Ground Transfer": CarFront,
  "Long Distance Transfer": CarFront,
  "Cross Border Transfer": MapPin,
  "Day / Hourly Packages": Clock3,
  "Tour Packages": Sparkles,
  "Medical Equipment Transfer": Sparkles
};

function formatPassengers(value) {
  if (!value) return "Pending";
  if (/^\d+$/.test(String(value))) return `${value} ${Number(value) === 1 ? "Adult" : "Adults"}`;
  return value;
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length > 10) return `+${digits}`;
  return value || "Pending";
}

function text(value) {
  return value || "Pending";
}

function summaryFor(draft) {
  const details = [
    `${draft.serviceType || "Travel service"} request`,
    `from ${draft.pickup || "pickup location"}`,
    `to ${draft.dropoff || "dropoff location"}`,
    `on ${draft.date || "travel date"}`,
    `at ${draft.time || "pickup time"}`
  ];
  if (draft.passengers) details.push(`for ${formatPassengers(draft.passengers)}`);
  if (draft.equipment) details.push(`with ${draft.equipment}`);
  if (draft.packageHours) details.push(`for ${draft.packageHours} hours`);
  if (draft.notes) details.push(`Notes: ${draft.notes}`);
  return `Customer requires ${details.join(" ")}. Preferred communication is ${draft.language || "English"}.`;
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4">
      <div className="text-sm font-semibold text-[#64748B]">{label}</div>
      <div className="mt-2 flex min-w-0 items-center gap-3 text-base font-black text-[#112E81]">
        {Icon ? <Icon size={18} className="shrink-0 text-[#0066DA]" /> : null}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function ReviewSection({ number, title, icon: Icon, children, onEdit }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-[#112E81]/10 bg-white p-5 shadow-[0_22px_70px_rgba(17,46,129,0.1)]"
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#112E81]/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#112E81] text-white shadow-[0_14px_30px_rgba(17,46,129,0.18)]">
            <Icon size={22} />
          </div>
          <h2 className="text-lg font-black text-[#112E81]">
            {number}. {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-[#0066DA]/18 bg-[#EEF6FF] px-4 py-3 text-sm font-bold text-[#0066DA] transition hover:bg-[#E0F0FF]"
        >
          <Edit3 size={16} />
          Edit
        </button>
      </div>
      {children}
    </motion.section>
  );
}

function StatusItem({ title, body }) {
  return (
    <div className="relative flex gap-4">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#00C68D] text-white shadow-[0_10px_22px_rgba(0,198,141,0.2)]">
        <Check size={16} strokeWidth={3} />
      </span>
      <div>
        <div className="font-black text-[#112E81]">{title}</div>
        <div className="mt-1 text-sm text-[#64748B]">{body}</div>
      </div>
    </div>
  );
}

export default function Review({
  draft,
  error,
  isSubmitting,
  progress,
  requiredFields = [],
  onBack,
  onSubmit
}) {
  const activeFields = requiredFields.length ? requiredFields : Object.keys(draft).filter((key) => draft[key]);
  const filled = progress?.filled || activeFields.filter((field) => String(draft[field] || "").trim()).length;
  const total = progress?.total || Math.max(activeFields.length, 1);
  const percent = Math.round((filled / total) * 100);
  const ServiceIcon = serviceIcons[draft.serviceType] || CarFront;
  const isMedical = draft.serviceType === "Medical Equipment Transfer";
  const isHourly = draft.serviceType === "Day / Hourly Packages";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="min-h-screen overflow-hidden bg-[#F8F9FA] px-4 py-7 text-[#212529]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,102,218,0.08),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(0,198,141,0.08),transparent_32%),linear-gradient(135deg,#F8F9FA,#ffffff_52%,#EEF4FB)]" />

      <div className="relative mx-auto max-w-[1520px]">
        <header className="mb-7 grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <BrandMark />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#112E81]">Review Your Request</h1>
            <p className="mt-2 text-[#64748B]">Please verify your travel details before submitting.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00C68D]/20 bg-[#00C68D]/10 px-4 py-3 text-sm font-black text-[#007B61]">
              <CheckCircle2 size={17} />
              Information Collected
            </div>
            <div className="hidden items-center gap-2 text-sm font-semibold text-[#64748B] sm:inline-flex">
              <ShieldCheck size={17} />
              Secure & Encrypted
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
          <main className="space-y-4">
            <ReviewSection number="1" title="Service Information" icon={ServiceIcon} onEdit={onBack}>
              <div className="grid gap-4 md:grid-cols-4">
                <Detail label="Service Type" value={text(draft.serviceType)} />
                <Detail icon={ArrowRight} label="Journey" value={`${text(draft.pickup)} -> ${text(draft.dropoff)}`} />
                <Detail icon={CalendarDays} label="Travel Date" value={text(draft.date)} />
                <Detail icon={Clock3} label={isHourly ? "Start Time" : "Pickup Time"} value={text(draft.time)} />
              </div>
              {isHourly || isMedical ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {isHourly ? <Detail icon={Clock3} label="Package Duration" value={`${text(draft.packageHours)} hours`} /> : null}
                  {isMedical ? <Detail icon={Sparkles} label="Equipment" value={text(draft.equipment)} /> : null}
                </div>
              ) : null}
            </ReviewSection>

            <ReviewSection number="2" title={isMedical ? "Care Details" : "Passenger Details"} icon={UsersRound} onEdit={onBack}>
              <div className="grid gap-4 md:grid-cols-3">
                <Detail icon={UserRound} label="Primary Contact Name" value={text(draft.name)} />
                {!isMedical ? <Detail icon={UsersRound} label="Passengers" value={formatPassengers(draft.passengers)} /> : null}
                <Detail icon={Lock} label={isMedical ? "Handling Notes" : "Luggage / Notes"} value={text(draft.notes)} />
              </div>
            </ReviewSection>

            <ReviewSection number="3" title="Contact Details" icon={Phone} onEdit={onBack}>
              <div className="grid gap-4 md:grid-cols-3">
                <Detail icon={Mail} label="Email" value={text(draft.email)} />
                <Detail icon={MessageCircle} label="WhatsApp" value={formatPhone(draft.phone)} />
                <Detail icon={MapPin} label="Preferred Language" value={text(draft.language || "English")} />
              </div>
            </ReviewSection>

            <ReviewSection number="4" title="AI Generated Summary" icon={Sparkles} onEdit={onBack}>
              <div className="rounded-2xl border border-[#0066DA]/15 bg-[#F8F9FA] p-5">
                <p className="text-lg leading-8 text-[#334155]">"{summaryFor(draft)}"</p>
                <div className="mt-4 text-right text-xs font-semibold text-[#0066DA]">Generated by Ulavi Vocis AI</div>
              </div>
            </ReviewSection>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          </main>

          <aside className="rounded-[26px] border border-[#112E81]/10 bg-white p-6 shadow-[0_28px_90px_rgba(17,46,129,0.12)] lg:sticky lg:top-7 lg:self-start">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#112E81] text-white shadow-[0_16px_34px_rgba(17,46,129,0.22)]">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#112E81]">Request Status</h2>
                <div className="mt-1 text-sm text-[#64748B]">{filled} / {total} details collected</div>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#00C68D,#0066DA)] transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>

            <div className="relative mt-8 space-y-7">
              <div className="absolute bottom-5 left-[13px] top-5 w-px bg-[#00C68D]/20" />
              <StatusItem title="Service Identified" body={draft.serviceType || "Selected service"} />
              <StatusItem title="Travel Details Collected" body="Date, time, journey" />
              <StatusItem title="Contact Information Collected" body="Email, WhatsApp, language" />
              <StatusItem title="Ready For Submission" body="Review and confirm your request" />
            </div>

            <div className="mt-7 grid gap-4 border-t border-[#112E81]/10 pt-6">
              <div className="rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-4">
                  <Clock3 size={22} className="text-[#0066DA]" />
                  <div>
                    <div className="text-sm text-[#64748B]">Estimated Response Time</div>
                    <div className="mt-1 font-black text-[#112E81]">Within 24 Hours</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-4">
                  <Headphones size={22} className="text-[#0066DA]" />
                  <div>
                    <div className="text-sm text-[#64748B]">Support</div>
                    <div className="mt-1 font-black text-[#112E81]">24/7 Available</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0066DA] px-6 py-5 text-lg font-black text-white shadow-[0_16px_34px_rgba(0,102,218,0.2)] transition hover:-translate-y-0.5 hover:bg-[#112E81] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={22} />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              onClick={onBack}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#0066DA]/20 bg-[#EEF6FF] px-6 py-5 text-lg font-black text-[#0066DA] transition hover:bg-[#E0F0FF]"
            >
              <Edit3 size={21} />
              Edit Details
            </button>
          </aside>
        </div>
      </div>
    </motion.section>
  );
}
