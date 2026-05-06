type ReceiptCardProps = {
  paymentMethod: string;
  orderId?: string;
  paymentId?: string;
  paidAt?: string | Date;
  amount: number | string;
  vaCode?: string;
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

export default function ReceiptCard({
  paymentMethod,
  orderId,
  paymentId,
  paidAt,
  amount,
  vaCode,
}: ReceiptCardProps) {
  const paidLabel = paidAt ? formatPaidAt(paidAt) : null;

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between bg-slate-900 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white/10">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold">Receipt</span>
        </div>
        {paymentId && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
            {paymentId}
          </span>
        )}
      </div>
      <dl className="divide-y divide-slate-100 text-sm">
        <div className="flex items-center justify-between px-5 py-3">
          <dt className="text-slate-500">Payment method</dt>
          <dd className="font-medium text-slate-900">{paymentMethod}</dd>
        </div>
        {orderId && (
          <div className="flex items-center justify-between px-5 py-3">
            <dt className="text-slate-500">Order ID</dt>
            <dd className="font-mono text-xs font-medium text-slate-900">
              {orderId}
            </dd>
          </div>
        )}
        {paymentId && (
          <div className="flex items-center justify-between px-5 py-3">
            <dt className="text-slate-500">Payment ID</dt>
            <dd className="font-mono text-xs font-medium text-slate-900">
              {paymentId}
            </dd>
          </div>
        )}
        {vaCode && (
          <div className="flex items-center justify-between px-5 py-3">
            <dt className="text-slate-500">VA Code</dt>
            <dd className="font-mono text-xs font-medium text-slate-900">
              {vaCode}
            </dd>
          </div>
        )}
        {paidLabel && (
          <div className="flex items-center justify-between px-5 py-3">
            <dt className="text-slate-500">Paid at</dt>
            <dd className="font-medium text-slate-900">{paidLabel} WIB</dd>
          </div>
        )}
        <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
          <dt className="font-semibold text-slate-900">Amount paid</dt>
          <dd className="text-xl font-bold text-emerald-600">
            {formatRp(amount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
