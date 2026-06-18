import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Headphones,
  Lock,
  Mail,
  MessageCircle,
  Mic,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import BrandMark from "../components/BrandMark.jsx";
import { fetchLeadByReference } from "../services/api.js";
import { services } from "../services/serviceCatalog.js";

const trustBar = [
  [Check, "No Registration"],
  [MessageCircle, "WhatsApp Updates"],
  [Mail, "Email Confirmation"],
  [Headphones, "24/7 Support"]
];

const timeline = [
  "Request Received",
  "Information Verified",
  "Operations Review",
  "Quotation Preparation",
  "Customer Contact",
  "Booking Confirmed"
];

function statusIndex(status = "") {
  const v = status.toLowerCase();
  if (/confirmed|complete|closed/.test(v)) return 5;
  if (/contact/.test(v)) return 4;
  if (/quotation|quote/.test(v)) return 3;
  if (/review|processing|new|operations/.test(v)) return 2;
  if (/verified/.test(v)) return 1;
  return 2;
}

function getLeadStatus(result) {
  const lead = result?.lead || {};
  return {
    reference: result?.reference || lead.reference_number || "",
    service: lead.service_type || "Travel Request",
    status: lead.status || "Operations Review",
    index: statusIndex(lead.status)
  };
}

export default function Home({ onStart }) {
  const [trackOpen, setTrackOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const trackStatus = useMemo(() => getLeadStatus(trackResult), [trackResult]);

  const startConversation = () => onStart?.("");
  const startService = (title) => onStart?.(title);

  async function checkStatus() {
    const value = reference.trim();
    if (!value) {
      setTrackError("Enter your reference number.");
      return;
    }
    setTracking(true);
    setTrackError("");
    setTrackResult(null);
    try {
      const result = await fetchLeadByReference(value);
      setTrackResult(result);
    } catch (err) {
      setTrackError(err.message || "Request not found. Please check the reference number.");
    } finally {
      setTracking(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-[#F8F9FA] text-[#212529]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(17,46,129,0.08),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(215,180,106,0.16),transparent_26%),linear-gradient(180deg,#ffffff,#F8F9FA_58%,#EEF3F8)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <BrandMark />
          <div className="inline-flex items-center gap-2 rounded-full border border-[#112E81]/10 bg-white px-5 py-3 text-sm font-black text-[#112E81] shadow-[0_16px_36px_rgba(17,46,129,0.08)]">
            <Headphones size={17} className="text-[#B98A2F]" />
            24/7 Travel Help
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] lg:py-16">
          <section className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7B46A]/35 bg-[#FFF9EC] px-4 py-2 text-sm font-black text-[#8A641D]">
              <ShieldCheck size={16} />
              Premium AI Travel Concierge
            </div>
            <h1 className="mt-7 font-display text-6xl font-black leading-[0.98] tracking-tight text-[#112E81] sm:text-7xl lg:text-8xl">
              Speak.
              <span className="block text-[#B98A2F]">Travel.</span>
              <span className="block text-[#112E81]">Arrive.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-[#475569]">
              Simple voice booking for airport transfers, chauffeur rides, cross-border travel, tours, and medical logistics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startConversation}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#112E81] px-8 py-5 text-base font-black text-white shadow-[0_20px_42px_rgba(17,46,129,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0066DA]"
              >
                Start Voice Conversation
                <ArrowRight size={19} />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("home-services")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center rounded-2xl border border-[#112E81]/12 bg-white px-8 py-5 text-base font-black text-[#112E81] shadow-[0_16px_34px_rgba(17,46,129,0.08)] transition hover:-translate-y-0.5 hover:bg-[#F1F5F9]"
              >
                Choose Service
              </button>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_50%_45%,rgba(0,102,218,0.24),transparent_42%),radial-gradient(circle_at_48%_52%,rgba(215,180,106,0.2),transparent_48%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-[#112E81]/10 bg-white p-8 text-center shadow-[0_28px_90px_rgba(17,46,129,0.14)] sm:p-10 lg:min-h-[560px]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(238,246,255,0.82)_52%,rgba(255,249,236,0.82))]" />
              <div className="pointer-events-none absolute inset-0 opacity-70">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span
                    key={index}
                    className="ulavi-particle"
                    style={{
                      left: `${8 + ((index * 17) % 84)}%`,
                      top: `${8 + ((index * 23) % 82)}%`,
                      animationDelay: `${index * 180}ms`
                    }}
                  />
                ))}
              </div>

              <div className="relative flex min-h-[500px] flex-col items-center justify-center">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#B98A2F]">Voice First Booking</p>
                <button
                  type="button"
                  onClick={startConversation}
                  aria-label="Start voice conversation"
                  className="ulavi-mic-button group relative mt-10 grid h-40 w-40 place-items-center rounded-full border border-[#0066DA]/30 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.72),rgba(0,102,218,0.92)_44%,rgba(17,46,129,0.98))] text-white shadow-[0_0_0_18px_rgba(0,102,218,0.08),0_26px_90px_rgba(17,46,129,0.34)] transition hover:scale-105 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
                >
                  <span className="ulavi-mic-ring" />
                  <span className="ulavi-mic-ripple" />
                  <Mic size={88} className="relative z-10 drop-shadow-[0_0_22px_rgba(255,255,255,0.86)] lg:h-28 lg:w-28" />
                </button>

                <div className="mt-10 flex w-full max-w-xl items-center justify-center gap-1.5 rounded-full border border-[#112E81]/10 bg-white/80 px-5 py-4 shadow-[0_18px_50px_rgba(17,46,129,0.1)] backdrop-blur-xl">
                  {Array.from({ length: 44 }).map((_, i) => (
                    <span key={i} className="ulavi-wave-bar ulavi-wave-bar-hero" style={{ animationDelay: `${i * 38}ms` }} />
                  ))}
                </div>

                <p className="mt-7 text-2xl font-black text-[#112E81]">Tap to speak</p>
                <p className="mt-3 max-w-md text-base leading-7 text-[#64748B]">
                  Tell Ulavi what transport service you need. The assistant will ask simple questions and prepare your request.
                </p>
              </div>
            </div>
          </section>
        </main>

        <section id="home-services" className="py-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B98A2F]">Services</p>
            <h2 className="mt-3 font-display text-4xl font-black text-[#112E81] sm:text-5xl">Choose Your Travel Service</h2>
          </div>
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} service={service} onStart={startService} />
            ))}
          </div>
        </section>

        <section className="py-7">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustBar.map(([Icon, title]) => (
              <div key={title} className="flex items-center gap-4 rounded-[22px] border border-[#112E81]/10 bg-white p-5 shadow-[0_18px_46px_rgba(17,46,129,0.08)]">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#112E81] text-white">
                  <Icon size={21} />
                </div>
                <p className="font-black text-[#112E81]">{title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl py-7">
          <div className="rounded-[30px] border border-[#112E81]/10 bg-white p-6 text-center shadow-[0_24px_80px_rgba(17,46,129,0.1)] sm:p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF3D4] text-[#B98A2F]">
              <Search size={25} />
            </div>
            <h2 className="mt-4 text-3xl font-black text-[#112E81]">Already Submitted A Request?</h2>
            <p className="mt-2 text-[#64748B]">Track your booking using your reference number.</p>
            <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ULV-XXXXXXXX"
                className="min-h-14 flex-1 rounded-2xl border border-[#112E81]/12 bg-[#F8F9FA] px-5 text-center font-mono text-base font-black text-[#112E81] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0066DA] sm:text-left"
              />
              <button
                type="button"
                onClick={() => {
                  setTrackOpen(true);
                  if (reference.trim()) checkStatus();
                }}
                className="rounded-2xl bg-[#112E81] px-8 py-4 font-black text-white shadow-[0_16px_34px_rgba(17,46,129,0.18)] transition hover:bg-[#0066DA]"
              >
                Track Request
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-[#112E81]/10 py-7 text-sm text-[#64748B] sm:flex-row">
          <p>ULAVI VOCIS AI Travel Concierge</p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck size={15} /> Secure voice-first booking
          </p>
        </footer>
      </div>

      {trackOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#112E81]/25 px-4 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl rounded-[28px] border border-[#112E81]/10 bg-white p-5 text-[#212529] shadow-[0_30px_120px_rgba(17,46,129,0.24)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B98A2F]">Track Your Request</p>
                <p className="mt-2 text-2xl font-black text-[#112E81]">Reference Number</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#112E81]/10 bg-[#F8F9FA] text-[#64748B] transition hover:text-[#112E81]"
                aria-label="Close tracking modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ULV-MQEX9J5F"
                className="min-h-13 flex-1 rounded-2xl border border-[#112E81]/12 bg-[#F8F9FA] px-4 font-mono text-sm font-black text-[#112E81] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0066DA]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkStatus();
                }}
              />
              <button
                type="button"
                onClick={checkStatus}
                disabled={tracking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#112E81] px-5 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(17,46,129,0.16)] transition hover:bg-[#0066DA] disabled:opacity-70"
              >
                <Search size={17} />
                {tracking ? "Checking..." : "Check Status"}
              </button>
            </div>

            {trackError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {trackError}
              </div>
            )}

            {trackResult && (
              <div className="mt-5 rounded-3xl border border-[#112E81]/10 bg-[#F8F9FA] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">Reference</p>
                <p className="mt-1 font-mono text-xl font-black text-[#00A878]">{trackStatus.reference}</p>
                <div className="mt-4 grid gap-3 rounded-2xl border border-[#112E81]/10 bg-white p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#64748B]">Service</p>
                    <p className="mt-1 font-bold text-[#112E81]">{trackStatus.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Current Status</p>
                    <p className="mt-1 font-bold text-[#0066DA]">{trackStatus.status}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {timeline.map((item, i) => {
                    const complete = i < trackStatus.index;
                    const active = i === trackStatus.index;
                    return (
                      <div key={item} className="flex items-center gap-3">
                        <div
                          className={`grid h-8 w-8 place-items-center rounded-full border text-sm font-bold ${
                            complete
                              ? "border-[#00C68D]/25 bg-[#00C68D]/12 text-[#00A878]"
                              : active
                                ? "border-[#0066DA]/25 bg-[#EEF6FF] text-[#0066DA]"
                                : "border-[#112E81]/12 bg-white text-[#94A3B8]"
                          }`}
                        >
                          {complete ? <CheckCircle2 size={17} /> : active ? <Clock3 size={16} /> : i + 1}
                        </div>
                        <p className={`text-sm font-bold ${active ? "text-[#0066DA]" : complete ? "text-[#112E81]" : "text-[#94A3B8]"}`}>
                          {item}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#64748B]">
              <Lock size={14} />
              Secure lookup. Reference numbers are used only for request status.
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

function ServiceCard({ service, onStart }) {
  const Icon = service.icon;
  const label = service.title.replace("Day / ", "").replace("Medical Equipment Transfer", "Medical Equipment");

  return (
    <button
      type="button"
      onClick={() => onStart?.(service.title)}
      className="group relative h-[260px] overflow-hidden rounded-[28px] border border-[#112E81]/10 bg-white text-left shadow-[0_20px_62px_rgba(17,46,129,0.12)] transition duration-300 hover:-translate-y-1.5 hover:border-[#D7B46A]/50 hover:shadow-[0_28px_74px_rgba(17,46,129,0.16)]"
    >
      <img
        src={service.image}
        alt={service.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(17,46,129,0.2)_40%,rgba(17,46,129,0.84))]" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/35 bg-white/90 text-[#112E81] shadow-[0_10px_26px_rgba(17,46,129,0.18)] backdrop-blur-xl">
          <Icon size={24} />
        </div>
        <p className="max-w-[14rem] text-2xl font-black leading-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
          {label}
        </p>
      </div>
      <div className="absolute bottom-6 right-6 grid h-11 w-11 place-items-center rounded-full bg-[#D7B46A] text-[#112E81] shadow-[0_12px_26px_rgba(0,0,0,0.22)]">
        <ArrowRight size={18} />
      </div>
    </button>
  );
}
