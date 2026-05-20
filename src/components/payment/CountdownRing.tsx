type CountdownRingProps = {
  secondsLeft: number;
  totalSeconds: number;
};

const CIRCUMFERENCE = 2 * Math.PI * 68;

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function CountdownRing({
  secondsLeft,
  totalSeconds,
}: CountdownRingProps) {
  const safeTotal = Math.max(1, totalSeconds);
  const ratio = Math.max(0, Math.min(1, secondsLeft / safeTotal));
  const dashOffset = CIRCUMFERENCE * (1 - ratio);
  const isExpired = secondsLeft <= 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg
          className="payment-ring-rotate h-40 w-40"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke={isExpired ? "#fca5a5" : "url(#payment-ring-gradient)"}
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
          <defs>
            <linearGradient id="payment-ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {isExpired ? "Expired" : "Time left"}
          </div>
          <div
            className={`font-mono font-bold text-slate-900 ${secondsLeft >= 3600 ? "text-lg" : "text-3xl"}`}
          >
            {formatTime(secondsLeft)}
          </div>
          {secondsLeft < 3600 && (
            <div className="text-xs text-slate-500">minutes</div>
          )}
        </div>
      </div>
    </div>
  );
}
