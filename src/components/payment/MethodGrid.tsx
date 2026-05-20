import {
  formatRupiahCompact,
  getTransactionLimit,
} from "@/utils/transaction-limit";
import MethodCard from "./MethodCard";

type Method = {
  _id: string;
  name: string;
  image?: string;
};

type MethodGroup = {
  category: string;
  methods: Method[];
};

type MethodGridProps = {
  groups: MethodGroup[];
  selectedMethodName: string | null;
  totalAmount: number;
  apiBaseUrl: string;
  onSelect: (method: Method) => void;
};

export default function MethodGrid({
  groups,
  selectedMethodName,
  totalAmount,
  apiBaseUrl,
  onSelect,
}: MethodGridProps) {
  if (!groups || groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">
          No payment method available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Please contact support to enable payment methods.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(({ category, methods }) => (
        <div key={category}>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <span className="h-1 w-1 rounded-full bg-sky-500" />
            {category}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {methods.map((method) => {
              const limit = getTransactionLimit(method.name);
              const isOutOfLimit =
                totalAmount < limit.min || totalAmount > limit.max;
              const isSelected = selectedMethodName === method.name;
              const state = isOutOfLimit
                ? "disabled"
                : isSelected
                  ? "selected"
                  : "default";

              return (
                <MethodCard
                  key={method._id}
                  name={method.name}
                  imageUrl={method.image ? `${apiBaseUrl}/${method.image}` : undefined}
                  state={state}
                  subLabel={`${formatRupiahCompact(limit.min)} – ${formatRupiahCompact(limit.max)}`}
                  disabledReason={isOutOfLimit ? "Out of limit" : undefined}
                  onClick={isOutOfLimit ? undefined : () => onSelect(method)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
