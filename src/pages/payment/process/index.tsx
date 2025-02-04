import { handleAxiosError } from "@/api";
import Loader from "@/components/loading";
import { encryptData } from "@/utils/encryption";
import { PaymentDetails } from "@/utils/order";
import { convertDateString, createSignatureForward } from "@/utils/paylabs";
import { cancelPayment } from "@/utils/payment";
import { initializeWebSocket } from "@/utils/websocket_initializer";
import axios from "axios";
import clsx from "clsx";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const PageProcess: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { data } = router.query;
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
        if (data) {
          const dataString = Array.isArray(data) ? data[0] : data;
          const response = await axios.get(
            `/api/payment?data=${encodeURIComponent(dataString)}`,
          );
          const paymentData = response.data;
          setOrderPayments(paymentData);
          setIsPaymentProcessing(paymentData.isPaymentProcessing);

          if (paymentData) {
            const currentTimestamp = new Date().toISOString();
            const formattedTimestamp = currentTimestamp.replace("Z", "+00:00");
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
            };

            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_CLIENT_API_URL}${endpointUrl}`,
                { headers },
              );

              if (
                response.status === 200 &&
                response.data.data.paymentStatus === "paid"
              ) {
                const encryptedData = encryptData(paymentData);
                const newLink = `${window.location.origin}/payment/success?data=${encodeURIComponent(
                  encryptedData,
                )}`;
                router.push(newLink);
              }
              if (
                response.data.success &&
                response.data.paymentStatus === "cancel"
              ) {
                setTimeLeft(0);
                toast.warn("Payment Canceled", { theme: "colored" });
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
        console.error("Error fetching order data:", error);
        toast.error("Error fetching order data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    if (!orderPayments) return; // Wait for orderPayments to be available

    const setupWebSocket = async () => {
      try {
        const websocket = await initializeWebSocket(
          "wss://wss.api.pg.pandi.id",
        );
        setWs(websocket); // Store the WebSocket instance

        // Set up event listeners for WebSocket messages
        websocket.onmessage = (event: MessageEvent) => {
          const msgData = JSON.parse(event.data);

          if (orderPayments) {
            if (
              msgData.paymentId === orderPayments?.paymentData.paymentId &&
              msgData.status === "paid"
            ) {
              // Redirect to the new page
              toast.success(msgData.status, { theme: "colored" });
              const encryptedData = encryptData(orderPayments);
              const newLink = `${window.location.origin}/payment/success?data=${encodeURIComponent(
                encryptedData,
              )}`;
              router.push(newLink).then(() => {
                if (websocket) {
                  websocket.close();
                }
              });
            }
          } else {
            toast.error(msgData.status, { theme: "colored" });
            setTimeLeft(0);
            setIsPaymentProcessing(true);
          }
        };

        websocket.onclose = () => {
          console.log(
            "WebSocket connection closed. Attempting to reconnect...",
          );
          // Attempt to reconnect after a delay
          setTimeout(setupWebSocket, 3000);
        };
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    };

    setupWebSocket();

    return () => {
      if (ws) {
        ws.close(); // Clean up WebSocket connection on unmount
      }
    };
  }, [orderPayments]); // Re-run this effect when orderPayments changes

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
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
          <button
            className="mt-4 w-full rounded-lg bg-red-500 py-2 font-bold text-white transition-colors hover:bg-red-600"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default PageProcess;
