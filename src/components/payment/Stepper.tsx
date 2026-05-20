import clsx from "clsx";

type StepperProps = {
  current: 1 | 2 | 3;
};

const STEPS = [
  { n: 1, label: "Confirm" },
  { n: 2, label: "Pay" },
  { n: 3, label: "Done" },
] as const;

const CheckIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default function Stepper({ current }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs">
      {STEPS.map((step, i) => {
        const isDone = step.n < current;
        const isActive = step.n === current;
        return (
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition",
                  isDone && "bg-emerald-500 text-white",
                  isActive && "bg-sky-500 text-white ring-4 ring-sky-100",
                  !isDone && !isActive && "bg-slate-100 text-slate-400",
                )}
              >
                {isDone ? <CheckIcon /> : step.n}
              </div>
              <span
                className={clsx(
                  "hidden font-medium sm:inline",
                  isDone && "text-emerald-600",
                  isActive && "text-slate-900",
                  !isDone && !isActive && "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 bg-slate-200 sm:w-10" />
            )}
          </div>
        );
      })}
    </div>
  );
}
