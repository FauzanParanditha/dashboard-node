import { handleAxiosError } from "@/api";
import Loader from "@/components/loading";
import {
  CountdownRing,
  DetailRow,
  ExpiredBanner,
  HowToPay,
  PaymentShell,
  QrCard,
  SectionHeader,
  VaCard,
  WaitingBanner,
} from "@/components/payment";
import { encryptData } from "@/utils/encryption";
import { PaymentDetails } from "@/utils/order";
import { convertDateString, createSignatureForward } from "@/utils/paylabs";
import { cancelPayment } from "@/utils/payment";
import { initializeWebSocket } from "@/utils/websocket_initializer";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

dayjs.extend(utc);
dayjs.extend(timezone);

const parseExpiration = (raw?: string): Date | null => {
  if (!raw) return null;
  if (raw.length === 14) {
    return convertDateString(raw);
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatRp = (n: number | string | undefined) => {
  const v = typeof n === "number" ? n : parseFloat((n as string) || "0");
  return `Rp ${v.toLocaleString("id-ID")}`;
};

const PageProcess: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { q } = router.query;
  const [orderPayments, setOrderPayments] = useState<PaymentDetails | null>(
    null,
  );
  const [, setIsPaymentProcessing] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isQris, setIsQris] = useState(false);

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
          setOrderPayments(paymentData);
          setIsQris(paymentData?.paymentData?.qrUrl ? true : false);
          setIsPaymentProcessing(paymentData.isPaymentProcessing);

          if (paymentData) {
            const formattedTimestamp = dayjs()
              .tz("Asia/Jakarta")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            const endpointUrl = `/api/v1/order/${paymentData?.paymentData?.id}`;
            const clientId = paymentData?.orderDetails?.clientId;

            const signature = createSignatureForward(
              "GET",
              endpointUrl,
              {},
              formattedTimestamp,
            );

            const headers = {
              "x-signature": signature,
              "x-partner-id": clientId,
              "x-timestamp": formattedTimestamp,
              "x-signer": "frontend",
            };

            try {
              const initialResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_CLIENT_API_URL}${endpointUrl}`,
                { headers },
              );

              if (
                initialResponse.status === 200 &&
                initialResponse.data.data.paymentStatus === "paid"
              ) {
                const encryptedData = encryptData(paymentData);
                const newLink = `${window.location.origin}/payment/success?q=${encodeURIComponent(
                  encryptedData,
                )}`;
                router.push(newLink);
              } else if (
                initialResponse.data.success &&
                initialResponse.data.data.paymentStatus === "cancel"
              ) {
                setTimeLeft(0);
                toast.warn("Payment Canceled", { theme: "colored" });
                ws?.onclose;
                return;
              }
            } catch (error) {
              handleAxiosError(error);
            }
          }

          const expirationDate = parseExpiration(
            paymentData?.paymentData?.paymentExpired,
          );

          if (expirationDate) {
            const now = new Date();
            const diffSec = Math.max(
              0,
              Math.floor((expirationDate.getTime() - now.getTime()) / 1000),
            );
            setTimeLeft(diffSec);
            setTotalSeconds(diffSec || 1);

            const timer = setInterval(() => {
              setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);

            return () => clearInterval(timer);
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

  useEffect(() => {
    if (!orderPayments) return;

    let websocket: WebSocket | null = null;

    const setupWebSocket = async () => {
      try {
        websocket = await initializeWebSocket(
          process.env.NEXT_PUBLIC_WS_URL as string,
        );
        setWs(websocket);

        websocket.onmessage = (event: MessageEvent) => {
          const msgData = JSON.parse(event.data);

          if (
            msgData.paymentId === orderPayments?.paymentData.paymentId &&
            msgData.status === "paid"
          ) {
            toast.success("Payment received", { theme: "colored" });
            const encryptedData = encryptData(orderPayments);
            const newLink = `${window.location.origin}/payment/success?q=${encodeURIComponent(
              encryptedData,
            )}`;
            router.push(newLink).then(() => {
              websocket?.close();
            });
          }
        };

        websocket.onclose = () => {
          setTimeout(setupWebSocket, 3000);
        };
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    };

    setupWebSocket();

    return () => {
      if (websocket) websocket.close();
      setWs(null);
    };
  }, [orderPayments]);

  const onSuccess = (data: any, link: any) => {
    window.parent.postMessage(
      { success: true, data, message: "05", link },
      "*",
    );
  };

  const onFailure = (error: any) => {
    window.parent.postMessage({ success: false, error }, "*");
  };

  const handleCancel = async () => {
    if (!orderPayments?.selectedPaymentMethod) {
      toast.warn("Please select a payment method.", { theme: "colored" });
      return;
    }

    Swal.fire({
      title: "Cancel this payment?",
      text: "You won't be able to revert this.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Keep paying",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      setLoading(true);
      try {
        await cancelPayment(
          orderPayments.selectedPaymentMethod,
          orderPayments,
          orderPayments.paymentMethods,
          setIsPaymentProcessing,
          setLoading,
          router,
          onSuccess,
          onFailure,
        );
      } catch {
        toast.error("Failed to cancel payment, please try again.");
      }
    });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Processing Payment</title>
        </Head>
        <div className="flex min-h-[200px] items-center justify-center py-12">
          <Loader />
        </div>
      </>
    );
  }

  const subTotal = parseFloat(orderPayments?.orderDetails.totalAmount || "0");
  const serviceFee = parseFloat(
    orderPayments?.paymentData.totalTransFee || "0",
  );
  const totalAmount = parseFloat(
    orderPayments?.paymentData.totalAmount || "0",
  );
  const isExpired = timeLeft <= 0;

  return (
    <>
      <Head>
        <title>Processing Payment</title>
      </Head>
      <PaymentShell
        currentStep={2}
        orderId={orderPayments?.paymentData.orderId}
      >
        {isExpired ? <ExpiredBanner /> : <WaitingBanner />}

        <div className="my-5">
          <CountdownRing
            secondsLeft={timeLeft}
            totalSeconds={totalSeconds || 1}
          />
        </div>

        {!isExpired && orderPayments?.paymentData && (
          <div className="mb-4">
            {isQris && orderPayments.paymentData.qrUrl ? (
              <QrCard
                qrUrl={orderPayments.paymentData.qrUrl}
                amount={totalAmount}
                method={orderPayments.selectedPaymentMethod}
              />
            ) : orderPayments.paymentData.virtualAccountNo ? (
              <VaCard
                vaNumber={orderPayments.paymentData.virtualAccountNo}
                amount={totalAmount}
                method={orderPayments.selectedPaymentMethod}
              />
            ) : null}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {orderPayments?.orderDetails.items &&
            orderPayments.orderDetails.items.length > 0 && (
              <>
                <SectionHeader>Order details</SectionHeader>
                <div className="divide-y divide-slate-100">
                  {orderPayments.orderDetails.items.map((item: any) => (
                    <DetailRow
                      key={item.id}
                      label={
                        <>
                          {item.name}{" "}
                          <span className="text-slate-400">
                            (×{item.quantity})
                          </span>
                        </>
                      }
                      value={formatRp(item.price)}
                    />
                  ))}
                </div>
              </>
            )}
          <SectionHeader>Payment info</SectionHeader>
          <div className="divide-y divide-slate-100">
            <DetailRow
              label="Payment method"
              value={orderPayments?.selectedPaymentMethod || "—"}
            />
            <DetailRow label="Sub total" value={formatRp(subTotal)} />
            <DetailRow label="Service fee" value={formatRp(serviceFee)} />
            <DetailRow
              label="Order ID"
              value={orderPayments?.paymentData.orderId || "—"}
              mono
            />
            <DetailRow
              label="Payment ID"
              value={orderPayments?.paymentData.paymentId || "—"}
              mono
            />
            {orderPayments?.paymentData.customerNo && (
              <DetailRow
                label="Customer No."
                value={orderPayments.paymentData.customerNo}
                mono
              />
            )}
          </div>
          <DetailRow label="Total" value={formatRp(totalAmount)} highlight />
        </div>

        {!isExpired && (
          <div className="mt-3">
            <HowToPay isQris={isQris} amount={totalAmount} />
          </div>
        )}

        {!isExpired && isQris && (
          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 w-full rounded-xl border border-rose-200 bg-white py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Cancel payment
          </button>
        )}
      </PaymentShell>
    </>
  );
};

export default PageProcess;
