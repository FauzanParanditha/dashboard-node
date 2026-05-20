import clsx from "clsx";
import { useState } from "react";

type MethodCardProps = {
  name: string;
  imageUrl?: string;
  state: "default" | "selected" | "disabled";
  subLabel?: string;
  disabledReason?: string;
  onClick?: () => void;
};

const initialsFor = (name: string) =>
  name
    .replace(/[^A-Za-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "—";

export default function MethodCard({
  name,
  imageUrl,
  state,
  subLabel,
  disabledReason,
  onClick,
}: MethodCardProps) {
  const [imgErrored, setImgErrored] = useState(false);
  const showImage = imageUrl && !imgErrored;

  const isDisabled = state === "disabled";
  const isSelected = state === "selected";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      aria-pressed={isSelected}
      className={clsx(
        "group relative flex flex-col items-center rounded-xl border p-3 transition",
        isSelected && "border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20",
        !isSelected && !isDisabled &&
          "cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
        isDisabled && "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60",
      )}
    >
      <div className="flex h-9 w-full items-center justify-center">
        {showImage ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgErrored(true)}
            className="h-8 w-auto max-w-[64px] object-contain"
          />
        ) : (
          <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600">
            {initialsFor(name)}
          </div>
        )}
      </div>
      <span className="mt-1.5 text-[13px] font-medium text-slate-900">
        {name}
      </span>
      {subLabel && !isDisabled && (
        <span className="mt-0.5 text-[10px] text-slate-500">{subLabel}</span>
      )}
      {isDisabled && disabledReason && (
        <span className="mt-0.5 text-[10px] font-medium text-rose-500">
          {disabledReason}
        </span>
      )}
      {isSelected && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white">
          <svg
            className="h-2.5 w-2.5"
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
        </span>
      )}
    </button>
  );
}
