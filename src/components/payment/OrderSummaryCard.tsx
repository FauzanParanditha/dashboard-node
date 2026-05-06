type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number | string;
};

type OrderSummaryCardProps = {
  items: OrderItem[];
  subTotal: number | string;
  serviceFee?: number | string;
  selectedMethodName?: string | null;
};

const toNumber = (v: number | string | undefined) =>
  typeof v === "number" ? v : parseFloat((v as string) || "0");

const formatRp = (v: number | string | undefined) =>
  `Rp ${toNumber(v).toLocaleString("id-ID")}`;

export default function OrderSummaryCard({
  items,
  subTotal,
  serviceFee,
  selectedMethodName,
}: OrderSummaryCardProps) {
  const sub = toNumber(subTotal);
  const fee = serviceFee !== undefined ? toNumber(serviceFee) : null;
  const total = fee !== null ? sub + fee : sub;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <h2 className="mb-2 text-xs font-semibold text-slate-700">
        Order summary
      </h2>
      <ul className="space-y-1.5 text-[13px]">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span className="text-slate-700">
              {item.name}{" "}
              <span className="text-slate-400">(×{item.quantity})</span>
            </span>
            <span className="font-medium text-slate-900">
              {formatRp(item.price)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-[13px]">
        <div className="flex justify-between text-slate-600">
          <span>Sub total</span>
          <span>{formatRp(sub)}</span>
        </div>
        {fee !== null && (
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              Service fee
              {selectedMethodName && (
                <span className="rounded bg-slate-200/70 px-1.5 py-0 text-[9px] font-medium uppercase text-slate-500">
                  {selectedMethodName}
                </span>
              )}
            </span>
            <span>{formatRp(fee)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
        <span className="text-[13px] font-semibold text-slate-900">Total</span>
        <span className="text-base font-bold text-sky-700">
          {formatRp(total)}
        </span>
      </div>
    </div>
  );
}
