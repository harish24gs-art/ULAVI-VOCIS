import { motion } from "framer-motion";
import {
  Check,
  Clock3,
  Copy,
  Download,
  Headphones,
  Home,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck
} from "lucide-react";
import { useMemo, useState } from "react";
import BrandMark from "../components/BrandMark.jsx";

function buildSummary(result) {
  const lead = result?.lead || {};
  const meta = lead.metadata || {};
  return [
    `Reference: ${result?.reference || lead.reference_number || "ULV-PENDING"}`,
    `Service: ${lead.service_type || "Pending"}`,
    `Name: ${lead.name || "Pending"}`,
    `Email: ${lead.email || "Pending"}`,
    `WhatsApp: ${lead.phone || "Pending"}`,
    `Pickup: ${meta.pickup || "Pending"}`,
    `Dropoff: ${meta.dropoff || "Pending"}`,
    `Date: ${meta.date || "Pending"}`,
    `Time: ${meta.time || "Pending"}`,
    `Passengers: ${meta.passengers || "Pending"}`,
    "",
    lead.summary || ""
  ].join("\n");
}

export default function Success({ result, onReset }) {
  const [copied, setCopied] = useState(false);
  const reference = result?.reference || result?.lead?.reference_number || "ULV-PENDING";
  const summary = useMemo(() => buildSummary(result), [result]);
  const submittedAt = new Date().toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  });

  async function copyReference() {
    await navigator.clipboard?.writeText(reference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadSummary() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reference}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function openWhatsApp() {
    window.open("https://wa.me/6591234567?text=Hi%20Ulavi%20Vocis%2C%20I%20need%20help%20with%20my%20booking.", "_blank", "noopener,noreferrer");
  }

  function openEmail() {
    window.location.href = `mailto:support@ulavivocis.com?subject=Help with ${encodeURIComponent(reference)}`;
  }

  function callSupport() {
    window.location.href = "tel:+6591234567";
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="relative min-h-screen overflow-hidden bg-[#F8F9FA] px-4 py-7 text-[#212529]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(0,198,141,0.14),transparent_22%),radial-gradient(circle_at_18%_24%,rgba(0,102,218,0.08),transparent_24%),linear-gradient(135deg,#F8F9FA,#ffffff_50%,#ECFDF7)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-[1180px] flex-col">
        <header className="mb-5 flex items-center justify-between gap-4">
          <BrandMark />
          <div className="hidden items-center gap-2 text-sm font-semibold text-[#64748B] sm:flex">
            <ShieldCheck size={17} />
            Secure & Encrypted
            <span className="h-2 w-2 rounded-full bg-[#00C68D] shadow-[0_0_14px_rgba(0,198,141,0.55)]" />
          </div>
        </header>

        <main className="grid flex-1 content-start gap-6 pt-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[#00C68D]/30 bg-[#00C68D]/10 text-[#00A878] shadow-[0_24px_60px_rgba(0,198,141,0.18)]">
              <Check size={58} strokeWidth={3} />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#112E81] sm:text-5xl">
              Request Submitted Successfully
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#64748B]">
              Your travel request has reached the Ulavi Vocis operations team. Please keep this reference number.
            </p>

            <section className="mx-auto mt-8 max-w-4xl rounded-[28px] border border-[#112E81]/10 bg-white p-6 shadow-[0_24px_90px_rgba(17,46,129,0.1)]">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B]">Reference Number</div>
              <div className="mt-3 break-all font-mono text-4xl font-black tracking-[0.08em] text-[#00A878]">
                {reference}
              </div>
              <div className="mt-2 text-sm text-[#64748B]">{submittedAt}</div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={copyReference} className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#112E81]/10 bg-[#F8F9FA] px-5 py-4 font-bold text-[#112E81] transition hover:bg-[#EEF6FF]">
                  <Copy size={18} />
                  {copied ? "Copied" : "Copy Reference"}
                </button>
                <button onClick={downloadSummary} className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#00C68D] px-5 py-4 font-bold text-white shadow-[0_14px_30px_rgba(0,198,141,0.2)] transition hover:bg-[#00A878]">
                  <Download size={18} />
                  Download Summary
                </button>
              </div>
            </section>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button onClick={onReset} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#112E81] px-6 py-5 text-lg font-black text-white shadow-[0_16px_34px_rgba(17,46,129,0.18)] transition hover:bg-[#0066DA]">
                <Plus size={22} />
                Create Another Request
              </button>
              <button onClick={onReset} className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#112E81]/12 bg-white px-6 py-5 text-lg font-black text-[#112E81] shadow-[0_14px_28px_rgba(17,46,129,0.08)] transition hover:bg-[#F8F9FA]">
                <Home size={22} />
                Return Home
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[26px] border border-[#112E81]/10 bg-white p-6 shadow-[0_28px_90px_rgba(17,46,129,0.1)]">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#64748B]">Need Help?</div>
              <div className="mt-6 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#00C68D]/12 text-[#00A878]">
                  <Headphones size={30} />
                </div>
                <div>
                  <div className="text-lg font-black text-[#112E81]">24/7 Support</div>
                  <div className="mt-1 text-sm text-[#64748B]">We are here to help.</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button onClick={openWhatsApp} className="flex w-full items-center justify-between rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4 text-left transition hover:bg-[#EEF6FF]">
                  <span className="flex items-center gap-3">
                    <MessageCircle className="text-[#00A878]" />
                    <span><span className="block font-black text-[#112E81]">WhatsApp Support</span><span className="text-sm text-[#64748B]">Chat with our team</span></span>
                  </span>
                  <span className="text-[#64748B]">›</span>
                </button>
                <button onClick={openEmail} className="flex w-full items-center justify-between rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4 text-left transition hover:bg-[#EEF6FF]">
                  <span className="flex items-center gap-3">
                    <Mail className="text-[#0066DA]" />
                    <span><span className="block font-black text-[#112E81]">Email Support</span><span className="text-sm text-[#64748B]">support@ulavivocis.com</span></span>
                  </span>
                  <span className="text-[#64748B]">›</span>
                </button>
                <button onClick={callSupport} className="flex w-full items-center justify-between rounded-2xl border border-[#112E81]/10 bg-[#F8F9FA] p-4 text-left transition hover:bg-[#EEF6FF]">
                  <span className="flex items-center gap-3">
                    <Phone className="text-[#0066DA]" />
                    <span><span className="block font-black text-[#112E81]">Call Support</span><span className="text-sm text-[#64748B]">+65 9123 4567</span></span>
                  </span>
                  <span className="text-[#64748B]">›</span>
                </button>
              </div>
            </section>

            <section className="rounded-[26px] border border-[#112E81]/10 bg-white p-6 shadow-[0_28px_90px_rgba(17,46,129,0.1)]">
              <div className="flex items-center gap-3">
                <Clock3 className="text-[#00A878]" />
                <div>
                  <div className="text-sm uppercase tracking-[0.12em] text-[#64748B]">Estimated Response Time</div>
                  <div className="mt-1 text-2xl font-black text-[#112E81]">Within 24 Hours</div>
                </div>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </motion.section>
  );
}
