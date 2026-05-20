/**
 * Dev-only preview route for the payment redesign.
 * Accessible at /payment/preview while running `npm run dev`.
 * Returns a notice in production builds.
 */
import {
  CountdownRing,
  DetailRow,
  ExpiredBanner,
  HowToPay,
  MethodGrid,
  OrderSummaryCard,
  PaymentShell,
  QrCard,
  ReceiptCard,
  SectionHeader,
  SuccessHero,
  VaCard,
  WaitingBanner,
} from "@/components/payment";
import clsx from "clsx";
import Head from "next/head";
import { useState } from "react";

const IS_PROD = process.env.NODE_ENV === "production";

const MOCK_ITEMS = [
  { id: "1", name: "Domain registration .id", price: 250000, quantity: 1 },
  { id: "2", name: "DNSSEC service", price: 50000, quantity: 1 },
];
const SUB_TOTAL = MOCK_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
const SERVICE_FEE = 1500;
const TOTAL = SUB_TOTAL + SERVICE_FEE;

const MOCK_GROUPS = [
  { category: "QRIS", methods: [{ _id: "m1", name: "QRIS", image: "" }] },
  {
    category: "Virtual Account",
    methods: [
      { _id: "m2", name: "MandiriVA", image: "" },
      { _id: "m3", name: "BNIVA", image: "" },
      { _id: "m4", name: "BRIVA", image: "" },
      { _id: "m5", name: "BCAVA", image: "" },
      { _id: "m6", name: "PermataVA", image: "" },
    ],
  },
];

// 1×1 transparent PNG so QR <img> doesn't 404 in mock
const FAKE_QR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='white'/><g fill='black'><rect x='10' y='10' width='40' height='40'/><rect x='18' y='18' width='24' height='24' fill='white'/><rect x='26' y='26' width='8' height='8'/><rect x='150' y='10' width='40' height='40'/><rect x='158' y='18' width='24' height='24' fill='white'/><rect x='166' y='26' width='8' height='8'/><rect x='10' y='150' width='40' height='40'/><rect x='18' y='158' width='24' height='24' fill='white'/><rect x='26' y='166' width='8' height='8'/><rect x='60' y='14' width='8' height='8'/><rect x='76' y='14' width='8' height='8'/><rect x='92' y='22' width='8' height='8'/><rect x='108' y='14' width='8' height='8'/><rect x='124' y='22' width='8' height='8'/><rect x='60' y='60' width='8' height='8'/><rect x='76' y='68' width='8' height='8'/><rect x='92' y='60' width='8' height='8'/><rect x='108' y='68' width='8' height='8'/><rect x='124' y='60' width='8' height='8'/><rect x='140' y='68' width='8' height='8'/><rect x='156' y='60' width='8' height='8'/><rect x='172' y='68' width='8' height='8'/><rect x='60' y='92' width='8' height='8'/><rect x='76' y='100' width='8' height='8'/><rect x='92' y='92' width='8' height='8'/><rect x='108' y='100' width='8' height='8'/><rect x='124' y='92' width='8' height='8'/><rect x='140' y='100' width='8' height='8'/><rect x='156' y='92' width='8' height='8'/><rect x='172' y='100' width='8' height='8'/><rect x='60' y='124' width='8' height='8'/><rect x='76' y='124' width='8' height='8'/><rect x='92' y='132' width='8' height='8'/><rect x='108' y='124' width='8' height='8'/><rect x='124' y='132' width='8' height='8'/><rect x='140' y='124' width='8' height='8'/><rect x='156' y='132' width='8' height='8'/><rect x='172' y='124' width='8' height='8'/><rect x='60' y='156' width='8' height='8'/><rect x='76' y='164' width='8' height='8'/><rect x='92' y='156' width='8' height='8'/><rect x='108' y='164' width='8' height='8'/><rect x='124' y='156' width='8' height='8'/><rect x='140' y='164' width='8' height='8'/><rect x='156' y='156' width='8' height='8'/><rect x='172' y='164' width='8' height='8'/></g></svg>";

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

type Tab =
  | "confirm"
  | "process-qris"
  | "process-va"
  | "expired"
  | "success-qris"
  | "success-va";

const TABS: { key: Tab; label: string }[] = [
  { key: "confirm", label: "Confirm" },
  { key: "process-qris", label: "Process · QRIS" },
  { key: "process-va", label: "Process · VA" },
  { key: "expired", label: "Process · Expired" },
  { key: "success-qris", label: "Success · QRIS" },
  { key: "success-va", label: "Success · VA" },
];

export default function PaymentPreviewPage() {
  const [tab, setTab] = useState<Tab>("confirm");
  const [selected, setSelected] = useState<string | null>(null);

  if (IS_PROD) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Preview not available in production.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Preview (DEV)</title>
      </Head>

      {/* Tab switcher */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            DEV Preview
          </span>
          <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "rounded-full px-3 py-1.5 font-medium",
                  tab === t.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "confirm" && (
        <PaymentShell currentStep={1} orderId="ORD-DEMO-A1B2">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Confirm Payment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your order and select a payment method.
            </p>
          </div>

          <div className="mt-5">
            <OrderSummaryCard
              items={MOCK_ITEMS}
              subTotal={SUB_TOTAL}
              selectedMethodName={selected}
            />
          </div>

          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              Select payment method
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                {MOCK_GROUPS.flatMap((g) => g.methods).length} options
              </span>
            </h2>
            <MethodGrid
              groups={MOCK_GROUPS}
              selectedMethodName={selected}
              totalAmount={SUB_TOTAL}
              apiBaseUrl=""
              onSelect={(m) => setSelected(m.name)}
            />
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <div className="text-xs text-slate-500">Total to pay</div>
              <div className="text-2xl font-bold text-slate-900">
                {formatRp(SUB_TOTAL)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">via</div>
              <div className="text-sm font-semibold text-sky-700">
                {selected || "—"}
              </div>
            </div>
          </div>

          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-sky-700 active:scale-[0.99]">
            Process Payment
          </button>
        </PaymentShell>
      )}

      {tab === "process-qris" && (
        <ProcessPreview variant="qris" expired={false} />
      )}
      {tab === "process-va" && (
        <ProcessPreview variant="va" expired={false} />
      )}
      {tab === "expired" && (
        <ProcessPreview variant="qris" expired={true} />
      )}
      {tab === "success-qris" && <SuccessPreview variant="qris" />}
      {tab === "success-va" && <SuccessPreview variant="va" />}
    </>
  );
}

function SuccessPreview({ variant }: { variant: "qris" | "va" }) {
  const isQris = variant === "qris";
  const paidAt = new Date().toISOString();
  return (
    <PaymentShell currentStep={3} orderId="ORD-DEMO-A1B2">
      <SuccessHero amount={TOTAL} paidAt={paidAt} />
      <div className="mt-6">
        <ReceiptCard
          paymentMethod={isQris ? "QRIS" : "MandiriVA"}
          orderId="ORD-DEMO-A1B2"
          paymentId="PAY-9F8E7D6C"
          paidAt={paidAt}
          amount={TOTAL}
          vaCode={isQris ? undefined : "8077081012345678"}
        />
      </div>
      <div className="mx-auto mt-6 max-w-md">
        <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-sky-700">
          Back to merchant
          <svg
            className="h-4 w-4 transition group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Need help? Contact{" "}
          <a className="text-sky-600 hover:underline" href="#">
            support@pandi.id
          </a>
        </p>
      </div>
    </PaymentShell>
  );
}

function ProcessPreview({
  variant,
  expired,
}: {
  variant: "qris" | "va";
  expired: boolean;
}) {
  const isQris = variant === "qris";
  const secondsLeft = expired ? 0 : 14 * 60 + 32;
  const totalSeconds = 15 * 60;
  return (
    <PaymentShell currentStep={2} orderId="ORD-DEMO-A1B2">
      {expired ? <ExpiredBanner /> : <WaitingBanner />}

      <div className="my-5">
        <CountdownRing
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
        />
      </div>

      {!expired && (
        <div className="mb-4">
          {isQris ? (
            <QrCard qrUrl={FAKE_QR} amount={TOTAL} method="QRIS" />
          ) : (
            <VaCard
              vaNumber="8077 0810 1234 5678"
              amount={TOTAL}
              method="MandiriVA"
            />
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <SectionHeader>Order details</SectionHeader>
        <div className="divide-y divide-slate-100">
          {MOCK_ITEMS.map((item) => (
            <DetailRow
              key={item.id}
              label={
                <>
                  {item.name}{" "}
                  <span className="text-slate-400">(×{item.quantity})</span>
                </>
              }
              value={formatRp(item.price)}
            />
          ))}
        </div>
        <SectionHeader>Payment info</SectionHeader>
        <div className="divide-y divide-slate-100">
          <DetailRow
            label="Payment method"
            value={isQris ? "QRIS" : "MandiriVA"}
          />
          <DetailRow label="Sub total" value={formatRp(SUB_TOTAL)} />
          <DetailRow label="Service fee" value={formatRp(SERVICE_FEE)} />
          <DetailRow label="Order ID" value="ORD-DEMO-A1B2" mono />
          <DetailRow label="Payment ID" value="PAY-9F8E7D6C" mono />
          {!isQris && (
            <DetailRow label="Customer No." value="628123456789" mono />
          )}
        </div>
        <DetailRow label="Total" value={formatRp(TOTAL)} highlight />
      </div>

      {!expired && (
        <div className="mt-3">
          <HowToPay isQris={isQris} amount={TOTAL} />
        </div>
      )}

      {!expired && isQris && (
        <button className="mt-4 w-full rounded-xl border border-rose-200 bg-white py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
          Cancel payment
        </button>
      )}
    </PaymentShell>
  );
}

