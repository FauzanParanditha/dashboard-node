import clsx from "clsx";

type DetailRowProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
};

export default function DetailRow({
  label,
  value,
  highlight,
  mono,
}: DetailRowProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between px-3 py-2 text-[13px]",
        highlight && "bg-sky-50/70",
      )}
    >
      <span
        className={clsx(highlight ? "font-semibold text-slate-900" : "text-slate-500")}
      >
        {label}
      </span>
      <span
        className={clsx(
          mono && "font-mono text-[12px]",
          highlight ? "text-sm font-bold text-sky-700" : "font-medium text-slate-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}
