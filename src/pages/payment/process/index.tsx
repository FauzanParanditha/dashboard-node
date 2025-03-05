import { handleAxiosError } from "@/api";
import Loader from "@/components/loading";
import { encryptData } from "@/utils/encryption";
import { PaymentDetails } from "@/utils/order";
import { convertDateString, createSignatureForward } from "@/utils/paylabs";
import { cancelPayment } from "@/utils/payment";
import { initializeWebSocket } from "@/utils/websocket_initializer";
import axios from "axios";
import clsx from "clsx";
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

const PageProcess: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { q } = router.query;
  const [orderPayments, setOrderPayments] = useState<PaymentDetails | null>(
    null,
  );
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  // const [isNewLink, setIsNewLink] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

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
          setIsPaymentProcessing(paymentData.isPaymentProcessing);

          if (paymentData) {
            const formattedTimestamp = dayjs()
              .tz("Asia/Jakarta")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            const endpointUrl =
              paymentData?.selectedMethod === "QRIS"
                ? `/api/v1/order/status/qris/${paymentData?.id}`
                : `/api/v1/order/status/va/snap/${paymentData?.id}`;
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
            };

            try {
              let response;
              if (paymentData?.selectedMethod === "QRIS") {
                response = await axios.get(
                  `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/status/qris/${paymentData?.id}`,
                  { headers },
                );
              } else if (paymentData?.selectedMethod === "VIRTUAL ACCOUNT") {
                response = await axios.get(
                  `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/status/va/snap/${paymentData?.id}`,
                  { headers },
                );
              }
              if (
                (paymentData?.selectedMethod === "QRIS" &&
                  response?.data.status === "02") ||
                (paymentData?.selectedMethod === "VIRTUAL ACCOUNT" &&
                  response?.data.responseCode === "2002600")
              ) {
                const encryptedData = encryptData(paymentData);
                const newLink = `${window.location.origin}/payment/success?q=${encodeURIComponent(
                  encryptedData,
                )}`;
                router.push(newLink);
              } else {
                setTimeLeft(0);
                toast.warn("An error occurred: ", { theme: "colored" });
                ws?.onclose;
                return;
              }
            } catch (error) {
              handleAxiosError(error);
            }
          }

          const paymentExpired = paymentData?.paymentData?.paymentExpired;
          const expirationDate =
            paymentExpired?.length === 14
              ? convertDateString(paymentExpired)
              : new Date(paymentExpired);

          const now = new Date();
          const difference = expirationDate.getTime() - now.getTime();
          setTimeLeft(Math.max(0, Math.floor(difference / 1000)));

          const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
          }, 1000);

          return () => clearInterval(timer);
        }
      } catch (error) {
        // console.error("Error fetching order data:", error);
        if ((error as any).status === 410) {
          toast.error("Order Expired");
          return;
        }
        toast.error("Error fetching order data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q]);

  useEffect(() => {
    console.log("🔄 Checking WebSocket initialization...");

    if (!orderPayments) {
      console.warn("⚠️ orderPayments is null, skipping WebSocket setup.");
      return;
    }

    let websocket: WebSocket | null = null; // Local variable for cleanup

    const setupWebSocket = async () => {
      try {
        websocket = await initializeWebSocket(
          process.env.NEXT_PUBLIC_WS_URL as string,
        );
        setWs(websocket); // Store the WebSocket instance in state

        websocket.onmessage = (event: MessageEvent) => {
          const msgData = JSON.parse(event.data);

          if (
            msgData.paymentId === orderPayments?.paymentData.paymentId &&
            msgData.status === "paid"
          ) {
            toast.success(msgData.status, { theme: "colored" });
            const encryptedData = encryptData(orderPayments);
            const newLink = `${window.location.origin}/payment/success?q=${encodeURIComponent(
              encryptedData,
            )}`;
            router.push(newLink).then(() => {
              websocket?.close(); // Close WebSocket after navigation
            });
          }
        };

        websocket.onclose = () => {
          console.log(
            "⚠️ WebSocket connection closed. Attempting to reconnect...",
          );
          setTimeout(setupWebSocket, 3000);
        };
      } catch (error) {
        console.error("❌ Failed to initialize WebSocket:", error);
      }
    };

    setupWebSocket();

    return () => {
      console.log("🔌 Cleaning up WebSocket...");
      if (websocket) {
        websocket.close();
        console.log("✅ WebSocket closed.");
      }
      setWs(null); // Reset state
    };
  }, [orderPayments]); // Re-run this effect when orderPayments changes

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  const onSuccess = (data: any) => {
    // Kirim data ke parent atau aplikasi yang memuat iframe
    window.parent.postMessage({ success: true, data, message: "05" }, "*");
  };

  const onFailure = (error: any) => {
    // Kirim error ke parent atau aplikasi yang memuat iframe
    window.parent.postMessage({ success: false, error }, "*");
  };

  const handleCancel = async () => {
    if (!orderPayments?.selectedPaymentMethod) {
      toast.warn("Please select a payment method.", { theme: "colored" });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "YES",
    }).then(async (result) => {
      if (result.isConfirmed) {
        //cancel
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
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Processed - Payment</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
          <h1
            aria-live="polite"
            className="mb-4 text-center text-3xl font-bold"
          >
            - Berlaku {timeLeft > 0 ? formatTime(timeLeft) : "00 : 00 : 00"} -
          </h1>
          {orderPayments?.paymentData?.virtualAccountNo ? (
            <div
              className={clsx(
                "mb-4 text-center",
                timeLeft > 0 ? "visible" : "hidden",
              )}
            >
              <h3 className="mb-4 text-center text-2xl font-semibold">
                Kode Pembayaran
              </h3>
              <div className="mb-4 text-center text-3xl font-bold">
                {orderPayments?.paymentData?.virtualAccountNo}
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                "mb-4 text-center",
                timeLeft > 0 ? "visible" : "hidden",
              )}
            >
              <img
                src={orderPayments?.paymentData?.qrUrl}
                alt="QR Code"
                className="mx-auto h-48 w-48"
              />
            </div>
          )}

          {/* Render Items */}
          <div className="mb-6 rounded-lg bg-gray-100 p-4">
            <ul className="list-disc gap-8 pl-5">
              <li className="flex justify-between">
                <span>Payment Method</span>
                <span>{orderPayments?.selectedPaymentMethod}</span>
              </li>
              {orderPayments?.orderDetails.items.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>Rp {parseFloat(item.price).toLocaleString()}</span>
                </li>
              ))}
              <li className="flex justify-between">
                <span>Total Pembayaran</span>
                <span>
                  Rp{" "}
                  {parseFloat(
                    orderPayments?.paymentData.totalAmount || "0",
                  ).toLocaleString()}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Order Id</span>
                <span>{orderPayments?.paymentData.orderId}</span>
              </li>
              <li className="flex justify-between">
                <span>Payment Id</span>
                <span>{orderPayments?.paymentData.paymentId}</span>
              </li>
              {/* {orderPayments?.paymentData.storeId && (
                <li className="flex justify-between">
                  <span>Store Id</span>
                  <span>{orderPayments?.paymentData.storeId}</span>
                </li>
              )} */}
              {orderPayments?.paymentData.customerNo && (
                <li className="flex justify-between">
                  <span>Customer Number</span>
                  <span>{orderPayments?.paymentData.customerNo}</span>
                </li>
              )}
              {/* <li className="flex justify-between">
                <span>Payer</span>
                <span>{orderPayments?.orderDetails.payer}</span>
              </li> */}
              {/* <li className="flex justify-between">
                <span>Phone Number</span>
                <span>{orderPayments?.orderDetails.phoneNumber}</span>
              </li> */}
            </ul>
          </div>
          {timeLeft > 0 && (
            <button
              className="mt-4 w-full rounded-lg bg-red-500 py-2 font-bold text-white transition-colors hover:bg-red-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PageProcess;
