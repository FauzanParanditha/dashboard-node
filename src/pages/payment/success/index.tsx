import Loader from "@/components/loading";
import {
  PaymentShell,
  ReceiptCard,
  SuccessHero,
} from "@/components/payment";
import { PaymentDetails, QRISData, VirtualAccountData } from "@/utils/order";
import { successPayment } from "@/utils/payment";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PageSuccess: React.FC = () => {
  const router = useRouter();
  const { q } = router.query;
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentDetails | null>(
    null,
  );
  const [qrisData, setQrisData] = useState<QRISData | null>(null);
  const [virtualAccountData, setVirtualAccountData] =
    useState<VirtualAccountData | null>(null);

  const onSuccess = (data: any) => {
    window.parent.postMessage({ success: true, data, message: "00" }, "*");
  };

  const onFailure = (error: any) => {
    window.parent.postMessage({ success: false, error }, "*");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (q) {
          const dataString = Array.isArray(q) ? q[0] : q;
          const response = await axios.get(
            `/api/payment?q=${encodeURIComponent(dataString)}`,
          );
          const paymentData = response.data;
          setPaymentSuccess(paymentData);

          if (paymentData) {
            const result = await successPayment(
              paymentData.paymentData.id,
              paymentData.orderDetails.clientId,
              paymentData.paymentMethods,
              paymentData.selectedPaymentMethod,
              setLoading,
              onSuccess,
              onFailure,
            );

            if (result && result.data) {
              if (paymentData.selectedPaymentMethod === "QRIS") {
                const qrisResult = result.data as QRISData;
                if (qrisResult.merchantId && qrisResult.qrCode) {
                  setQrisData(qrisResult);
                } else {
                  toast.error("Invalid QRIS data structure");
                }
              } else {
                const vaResult = result.data as VirtualAccountData;
                if (vaResult.merchantId && vaResult.vaCode) {
                  setVirtualAccountData(vaResult);
                } else {
                  toast.error("Invalid Virtual Account data structure");
                }
              }
            } else {
              toast.error("Payment data not available");
            }
          } else {
            toast.warn("Order data not yet available.");
          }
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
        toast.error("Error fetching order data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q]);

  const handleBackToMerchant = () => {
    window.parent.postMessage(
      { type: "pandi-payment:done", success: true },
      "*",
    );
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Payment Successful</title>
        </Head>
        <div className="flex min-h-[200px] items-center justify-center py-12">
          <Loader />
        </div>
      </>
    );
  }

  // Resolve unified display values from either QRIS or VA data
  const status = qrisData?.status ?? virtualAccountData?.status;
  const isSuccess = status === "02" || status === "00";
  const paymentType =
    qrisData?.paymentType ??
    virtualAccountData?.paymentType ??
    paymentSuccess?.selectedPaymentMethod ??
    "—";
  const amount = qrisData?.amount ?? virtualAccountData?.amount ?? "0";
  const successTime =
    qrisData?.successTime ?? virtualAccountData?.successTime;
  const vaCode = virtualAccountData?.vaCode;
  const orderId = paymentSuccess?.paymentData.orderId;
  const paymentId = paymentSuccess?.paymentData.paymentId;

  return (
    <>
      <Head>
        <title>Payment Successful</title>
      </Head>
      <PaymentShell currentStep={3} orderId={orderId}>
        {isSuccess ? (
          <>
            <SuccessHero amount={amount} paidAt={successTime} />

            <div className="mt-6">
              <ReceiptCard
                paymentMethod={paymentType}
                orderId={orderId}
                paymentId={paymentId}
                paidAt={successTime}
                amount={amount}
                vaCode={vaCode}
              />
            </div>

            <div className="mx-auto mt-6 max-w-md">
              <button
                type="button"
                onClick={handleBackToMerchant}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-sky-700 active:scale-[0.99]"
              >
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
                <a
                  className="text-sky-600 hover:underline"
                  href="mailto:support@pandi.id"
                >
                  support@pandi.id
                </a>
              </p>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
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
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Payment status unclear
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {status
                ? `We received status code "${status}". Please check your bank or e-wallet for confirmation.`
                : "We could not retrieve the payment status. Please try again or contact support."}
            </p>
          </div>
        )}
      </PaymentShell>
    </>
  );
};

// Per-order CSP frame-ancestors (only the order's merchant may iframe this).
export { getServerSideProps } from "@/utils/frameAncestors";

export default PageSuccess;
