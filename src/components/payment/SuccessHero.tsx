type SuccessHeroProps = {
  amount: number | string;
  paidAt?: string | Date;
};

const toNumber = (v: number | string) =>
  typeof v === "number" ? v : parseFloat(v || "0");

const formatRp = (v: number | string) =>
  `Rp ${toNumber(v).toLocaleString("id-ID")}`;

const formatPaidAt = (paidAt: string | Date) => {
  try {
    const d = typeof paidAt === "string" ? new Date(paidAt) : paidAt;
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  } catch {
    return null;
  }
};

export default function SuccessHero({ amount, paidAt }: SuccessHeroProps) {
  const paidLabel = paidAt ? formatPaidAt(paidAt) : null;

  return (
    <div className="flex flex-col items-center pb-2 pt-2 text-center">
      <div className="payment-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl" />
        <svg
          className="relative h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path className="payment-draw-check" d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
        Payment Successful
      </h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Your payment of{" "}
        <span className="font-semibold text-slate-900">{formatRp(amount)}</span>{" "}
        has been received.
      </p>
      {paidLabel && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Paid at: {paidLabel} WIB
        </div>
      )}
    </div>
  );
}
