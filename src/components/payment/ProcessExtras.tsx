import { useState } from "react";
import { toast } from "react-toastify";

const formatRp = (n: number | string | undefined) => {
  const v = typeof n === "number" ? n : parseFloat((n as string) || "0");
  return `Rp ${v.toLocaleString("id-ID")}`;
};

export const SectionHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="border-y border-slate-100 bg-slate-50/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 first:border-t-0">
    {children}
  </div>
);

export const WaitingBanner = () => (
  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
    </span>
    <div className="flex-1">
      <div className="text-sm font-semibold text-amber-900">
        Waiting for payment
      </div>
      <div className="text-xs text-amber-700">
        We will auto-confirm once received.
      </div>
    </div>
  </div>
);

export const ExpiredBanner = () => (
  <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
    <svg
      className="h-5 w-5 text-rose-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <div className="flex-1">
      <div className="text-sm font-semibold text-rose-900">Payment expired</div>
      <div className="text-xs text-rose-700">
        The payment window has closed. Please start over from the merchant.
      </div>
    </div>
  </div>
);

type QrCardProps = {
  qrUrl: string;
  amount: number;
  method?: string;
};
export const QrCard = ({ qrUrl, amount, method }: QrCardProps) => (
  <div className="mx-auto max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-12 items-center justify-center rounded bg-slate-900 text-[9px] font-bold text-white">
          QRIS
        </div>
        <span className="text-xs font-medium text-slate-700">Scan to pay</span>
      </div>
    </div>
    <div className="grid aspect-square place-items-center rounded-xl bg-[radial-gradient(at_30%_30%,#f1f5f9,#fff)] ring-1 ring-slate-100">
      <img src={qrUrl} alt="QR Code" className="h-44 w-44 object-contain" />
    </div>
    <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <div>
        <div className="text-[10px] text-slate-500">Amount</div>
        <div className="text-sm font-semibold text-slate-900">
          {formatRp(amount)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-slate-500">Method</div>
        <div className="text-sm font-semibold text-slate-900">
          {method || "—"}
        </div>
      </div>
    </div>
  </div>
);

type VaCardProps = {
  vaNumber: string;
  amount: number;
  method?: string;
};
export const VaCard = ({ vaNumber, amount, method }: VaCardProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium text-slate-500">
        Virtual Account Number
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <span className="font-mono text-xl font-bold tracking-wider text-slate-900">
          {vaNumber}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-sky-600 ring-1 ring-slate-200 hover:bg-sky-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500">Amount</span>
        <span className="font-semibold text-slate-900">{formatRp(amount)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-slate-500">Method</span>
        <span className="font-semibold text-slate-900">{method || "—"}</span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Transfer the exact amount above. Different amounts may not be detected
        automatically.
      </p>
    </div>
  );
};

type HowToPayProps = {
  isQris: boolean;
  amount: number;
};
export const HowToPay = ({ isQris, amount }: HowToPayProps) => (
  <details className="group rounded-xl border border-slate-200 bg-white">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700">
      How to pay
      <svg
        className="h-4 w-4 transition group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </summary>
    <ol className="list-decimal space-y-1.5 border-t border-slate-100 px-8 py-3 text-xs text-slate-600">
      {isQris ? (
        <>
          <li>Open your e-wallet or mobile banking app.</li>
          <li>
            Tap <span className="font-medium">Scan QRIS</span>.
          </li>
          <li>Confirm the amount {formatRp(amount)} and complete payment.</li>
          <li>This page will update automatically.</li>
        </>
      ) : (
        <>
          <li>Open your mobile banking or ATM.</li>
          <li>Choose Transfer → Virtual Account.</li>
          <li>Enter the VA number above.</li>
          <li>Confirm the amount {formatRp(amount)} and complete payment.</li>
        </>
      )}
    </ol>
  </details>
);
