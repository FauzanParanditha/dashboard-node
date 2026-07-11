import Loader from "@/components/loading";
import {
  MethodGrid,
  OrderSummaryCard,
  PaymentShell,
} from "@/components/payment";
import {
  OrderDetails,
  PaymentData,
  PaymentMethodsResponse,
} from "@/utils/order";
import { fetchPaymentMethods, processPayment } from "@/utils/payment";
import { formatRupiah, getTransactionLimit } from "@/utils/transaction-limit";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_CLIENT_API_URL || "";

const PaymentPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodsResponse[]
  >([]);
  const [, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    if (q) {
      const dataString = Array.isArray(q) ? q[0] : q;
      axios
        .get(`/api/payment?q=${encodeURIComponent(dataString)}`)
        .then((response) => {
          setOrderDetails(response.data);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || "Error fetching order data";
          toast.error(errorMessage);
          setLoading(false);
        });
      return;
    }
    setLoading(false);
  }, [q]);

  useEffect(() => {
    if (!orderDetails?.clientId) return;
    fetchPaymentMethods(setPaymentMethods, setLoading, orderDetails.clientId);
  }, [orderDetails?.clientId]);

  const handlePaymentMethodSelect = (method: { name: string }) => {
    if (isPaymentProcessing || !orderDetails) return;

    const totalAmount = parseFloat(orderDetails.totalAmount || "0");
    const limit = getTransactionLimit(method.name);
    const isOutOfLimit = totalAmount < limit.min || totalAmount > limit.max;

    if (isOutOfLimit) {
      toast.warn(
        `${method.name} only supports ${formatRupiah(limit.min)} – ${formatRupiah(limit.max)}`,
        { theme: "colored" },
      );
      return;
    }

    setSelectedPaymentMethod(method.name);
  };

  const handleSubmit = async () => {
    if (!selectedPaymentMethod) {
      toast.warn("Please select a payment method.", { theme: "colored" });
      return;
    }

    if (!orderDetails) {
      toast.warn("Order details not found.", { theme: "colored" });
      return;
    }

    const selectedMethod = paymentMethods
      .flatMap(({ methods }: any) => methods)
      .find((method: any) => method.name === selectedPaymentMethod);

    if (!selectedMethod) {
      toast.warn("Selected payment method not found.", { theme: "colored" });
      return;
    }

    const selectedMethodLimit = getTransactionLimit(selectedMethod.name);
    const orderAmount = parseFloat(orderDetails.totalAmount || "0");
    const isOutOfLimit =
      orderAmount < selectedMethodLimit.min ||
      orderAmount > selectedMethodLimit.max;

    if (isOutOfLimit) {
      toast.warn(
        `${selectedMethod.name} only supports ${formatRupiah(selectedMethodLimit.min)} – ${formatRupiah(selectedMethodLimit.max)}`,
        { theme: "colored" },
      );
      return;
    }

    try {
      const onSuccess = (data: any, link: any) => {
        window.parent.postMessage(
          { success: true, data, message: "01", link },
          "*",
        );
      };

      const onFailure = (error: any) => {
        window.parent.postMessage({ success: false, error }, "*");
      };

      await processPayment(
        selectedPaymentMethod,
        paymentMethods,
        orderDetails,
        setPaymentData,
        setIsPaymentProcessing,
        router,
        onSuccess,
        onFailure,
      );
    } catch {
      toast.error("Failed to process payment, please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Confirm Payment</title>
        </Head>
        <div className="flex min-h-[200px] items-center justify-center py-12">
          <Loader />
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Head>
          <title>Confirm Payment</title>
        </Head>
        <div className="flex min-h-[200px] items-center justify-center py-12">
          <p className="text-slate-600">No order detail found.</p>
        </div>
      </>
    );
  }

  const totalAmount = parseFloat(orderDetails.totalAmount || "0");

  return (
    <>
      <Head>
        <title>Confirm Payment</title>
      </Head>
      <PaymentShell currentStep={1}>
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
            items={orderDetails.items}
            subTotal={totalAmount}
            selectedMethodName={selectedPaymentMethod}
          />
        </div>

        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            Select payment method
            {paymentMethods.length > 0 && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                {paymentMethods.flatMap((g: any) => g.methods || []).length}{" "}
                options
              </span>
            )}
          </h2>
          <MethodGrid
            groups={paymentMethods as any}
            selectedMethodName={selectedPaymentMethod}
            totalAmount={totalAmount}
            apiBaseUrl={API_BASE_URL}
            onSelect={handlePaymentMethodSelect}
          />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <div className="text-xs text-slate-500">Total to pay</div>
            <div className="text-2xl font-bold text-slate-900">
              Rp {totalAmount.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">via</div>
            <div className="text-sm font-semibold text-sky-700">
              {selectedPaymentMethod || "—"}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPaymentProcessing}
          className="mt-3 group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPaymentProcessing ? "Processing..." : "Process Payment"}
          {!isPaymentProcessing && (
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
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Encrypted via TLS · Powered by PANDI Payment
        </p>
      </PaymentShell>
    </>
  );
};

// Per-order CSP frame-ancestors (only the order's merchant may iframe this).
export { getServerSideProps } from "@/utils/frameAncestors";

export default PaymentPage;
