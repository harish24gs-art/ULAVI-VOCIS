import { LoaderCircle, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

function supportedMimeType() {
  return mimeTypes.find((type) => window.MediaRecorder?.isTypeSupported(type)) || "audio/webm";
}

function permissionMessage(error) {
  if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
    return "Microphone permission was denied. Please allow microphone access and try again.";
  }
  if (error?.name === "NotFoundError") return "No microphone was found on this device.";
  return "Unable to access the microphone. Open the app on localhost or HTTPS and try again.";
}

export default function VoiceRecorder({ disabled, onVoice, onError, variant = "default" }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const smoothedLevelsRef = useRef(Array.from({ length: 54 }, () => 0.08));
  const [state, setState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [voiceScore, setVoiceScore] = useState(null);
  const [levels, setLevels] = useState(() => Array.from({ length: 54 }, () => 0.08));

  function stopAudioAnalysis() {
    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close?.().catch(() => {});
    }
    audioContextRef.current = null;
    const resting = Array.from({ length: 54 }, () => 0.08);
    smoothedLevelsRef.current = resting;
    setLevels(resting);
  }

  function startAudioAnalysis(stream) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    const context = new AudioContextCtor();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.42;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;
    analyserRef.current = analyser;
    context.resume?.().catch(() => {});

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeData = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);
      const now = performance.now();
      const rms = Math.sqrt(
        timeData.reduce((sum, value) => {
          const centered = (value - 128) / 128;
          return sum + centered * centered;
        }, 0) / timeData.length
      );
      const voiceEnergy = Math.min(1, rms * 28);
      const next = Array.from({ length: 54 }, (_, index) => {
        const bucket = frequencyData[Math.floor((index / 54) * frequencyData.length)] || 0;
        const centerDistance = Math.abs(index - 26.5) / 26.5;
        const smoothShape = 0.55 + (1 - centerDistance) * 0.75;
        const ripple = 0.8 + Math.sin(now / 150 + index * 0.18) * 0.28;
        const speechLevel = Math.max(bucket / 88, voiceEnergy * smoothShape * ripple);
        const idleMotion = voiceEnergy > 0.05 ? 0 : 0.045;
        const rawLevel = Math.max(idleMotion, speechLevel);
        const previous = smoothedLevelsRef.current[index] || 0.08;
        return Math.max(0.08, Math.min(1, previous * 0.72 + rawLevel * 0.28));
      });
      smoothedLevelsRef.current = next;
      setLevels(next);
      animationRef.current = window.requestAnimationFrame(tick);
    };
    tick();
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onError?.("Microphone is unavailable in this browser.");
      return;
    }
    try {
      setState("recording");
      const instantLevels = Array.from({ length: 54 }, () => 0.06);
      smoothedLevelsRef.current = instantLevels;
      setLevels(instantLevels);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: supportedMimeType() });
      startAudioAnalysis(stream);
      chunksRef.current = [];
      elapsedRef.current = 0;
      startedAtRef.current = performance.now();
      setElapsed(0);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        window.clearInterval(timerRef.current);
        stopAudioAnalysis();
        setState("processing");
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        const durationSeconds = Math.max((performance.now() - startedAtRef.current) / 1000, elapsedRef.current);
        if (durationSeconds < 1) {
          setState("idle");
          setVoiceScore(null);
          onError?.("Recording was too short. Please speak for at least 1 second.");
          return;
        }
        const sizeScore = Math.min(100, Math.round(blob.size / 140));
        const durationScore = Math.min(100, Math.round(durationSeconds * 24));
        const score = Math.max(55, Math.min(98, Math.round((sizeScore + durationScore) / 2)));
        setVoiceScore({
          score,
          accuracy: score >= 82 ? "High" : score >= 68 ? "Good" : "Fair",
          rating: score >= 82 ? "Clear" : score >= 68 ? "Usable" : "Try closer"
        });
        try {
          const audioBase64 = await blobToBase64(blob);
          if (!audioBase64 || audioBase64.length < 24) {
            onError?.("I could not capture your voice clearly. Please try again.");
            return;
          }
          await onVoice(audioBase64, blob.type);
        } finally {
          setState("idle");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= 60) stop();
      }, 1000);
    } catch (error) {
      stopAudioAnalysis();
      setState("idle");
      onError?.(permissionMessage(error));
    }
  }

  function stop() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    try {
      recorder.requestData?.();
    } catch {
      // Some browsers do not allow requestData at this moment; stop still flushes.
    }
    recorder.stop();
  }

  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isDock = variant === "dock";
  const isHero = variant === "hero";
  const isReview = variant === "review";

  useEffect(() => () => stopAudioAnalysis(), []);

  return (
    <div className={`flex shrink-0 items-center gap-3 ${isHero ? "flex-col" : ""} ${isDock || isHero || isReview ? "relative z-10" : ""}`}>
      {((isReview || isDock) && !isHero) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className={`absolute rounded-full border border-[#00C68D]/35 ${isReview ? "h-24 w-24 animate-ping" : "h-28 w-28 animate-pulse"}`} />
          <span className={`absolute rounded-full bg-[#0066DA]/10 blur-xl ${isReview ? "h-28 w-28" : "h-32 w-32"}`} />
        </div>
      )}
      <button
        type="button"
        disabled={disabled || isProcessing}
        onClick={isRecording ? stop : start}
        className={`grid shrink-0 place-items-center rounded-full transition ${
          isHero
            ? "h-36 w-36 border border-white/70 shadow-[0_0_0_14px_rgba(0,198,141,0.12),0_24px_60px_rgba(17,46,129,0.28),inset_0_0_34px_rgba(255,255,255,0.16)]"
            : isReview
              ? "h-24 w-24 border border-blue-200/60 shadow-[0_0_0_10px_rgba(37,99,235,0.14),0_0_58px_rgba(37,99,235,0.58),inset_0_0_26px_rgba(255,255,255,0.16)]"
            : isDock
              ? "h-20 w-20 border border-blue-300/50 shadow-[0_0_0_8px_rgba(67,92,255,0.16),0_0_45px_rgba(67,92,255,0.72)]"
              : "h-12 w-12"
        } ${
          isRecording
            ? "bg-ember text-white shadow-[0_0_0_10px_rgba(244,127,99,0.16)]"
            : isProcessing
              ? "bg-jade text-ink"
              : isDock || isHero || isReview
                ? "bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.28),rgba(0,102,218,0.94)_42%,rgba(17,46,129,0.96))] text-white"
                : "bg-champagne text-ink shadow-glow"
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={isRecording ? "Stop recording" : "Start voice recording"}
      >
        {isProcessing ? (
          <LoaderCircle size={isHero ? 48 : isReview ? 38 : isDock ? 30 : 20} className="animate-spin" />
        ) : isRecording ? (
          <Square size={isHero ? 36 : isReview ? 28 : isDock ? 24 : 17} />
        ) : (
          <Mic size={isHero ? 58 : isReview ? 42 : isDock ? 34 : 20} />
        )}
      </button>
      {isHero && (
        <div className="mt-5 flex h-14 w-[min(780px,84vw)] max-w-full items-center justify-center gap-1 rounded-full border border-white/35 bg-white/18 px-5 backdrop-blur-xl">
          {levels.map((level, index) => (
            <span
              key={index}
              className="voice-linear-bar"
              style={{
                height: isRecording ? `${Math.round(6 + level * 46)}px` : "3px",
                opacity: isRecording ? Math.max(0.48, Math.min(1, level + 0.18)) : 0.48
              }}
            />
          ))}
        </div>
      )}
      {isReview && (
        <div className="hidden min-w-[220px] text-left sm:block">
          <div className="text-sm font-black text-[#112E81]">{isRecording ? "Listening..." : isProcessing ? "Processing..." : "Tap to confirm"}</div>
          <div className="mt-2 flex h-7 w-full items-center gap-1 rounded-full border border-[#112E81]/10 bg-white px-3">
            {levels.slice(8, 42).map((level, index) => (
              <span
                key={index}
                className="voice-linear-bar"
                style={{
                  height: isRecording ? `${Math.round(4 + level * 24)}px` : "3px",
                  opacity: isRecording ? Math.max(0.42, level) : 0.48
                }}
              />
            ))}
          </div>
        </div>
      )}
      {(isRecording || isProcessing) && !isDock && !isReview && (
        <div className="hidden min-w-24 sm:block">
          <div className={`mb-1 flex h-7 items-center justify-center gap-1 ${isRecording ? "opacity-100" : "opacity-60"}`}>
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="voice-wave-bar" style={{ animationDelay: `${index * 70}ms` }} />
            ))}
          </div>
          <div className="text-center font-mono text-xs text-ember">
          {isProcessing ? "Processing" : `0:${String(elapsed).padStart(2, "0")}`}
          </div>
        </div>
      )}
      {voiceScore && !isRecording && !isProcessing && !isDock && (
        <div className="hidden rounded-lg border border-jade/25 bg-jade/10 px-3 py-2 text-xs text-ink/70 sm:block">
          <div className="font-semibold text-jade">Voice {voiceScore.score}%</div>
          <div>{voiceScore.accuracy} accuracy | {voiceScore.rating}</div>
        </div>
      )}
    </div>
  );
}
