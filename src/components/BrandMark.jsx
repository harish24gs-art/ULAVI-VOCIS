export default function BrandMark({ compact = false, tone = "dark" }) {
  const textClass = tone === "light" ? "text-pearl" : "text-ink";
  const subClass = tone === "light" ? "text-pearl/55" : "text-ink/55";

  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg border border-champagne/35 bg-champagne text-sm font-black text-ink shadow-glow">
        UV
      </div>
      {!compact && (
        <div>
          <div className={`text-sm font-bold uppercase tracking-[0.22em] ${textClass}`}>
            Ulavi Vocis
          </div>
          <div className={`text-xs ${subClass}`}>AI voice concierge</div>
        </div>
      )}
    </div>
  );
}
