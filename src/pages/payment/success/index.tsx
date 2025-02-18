import Loader from "@/components/loading";
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
    // Kirim data ke parent atau aplikasi yang memuat iframe
    window.parent.postMessage({ success: true, data }, "*");
  };

  const onFailure = (error: any) => {
    // Kirim error ke parent atau aplikasi yang memuat iframe
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
                // Narrow down to QRISData type
                const qrisResult = result.data as QRISData;
                if (qrisResult.merchantId && qrisResult.qrCode) {
                  setQrisData(qrisResult);
                } else {
                  toast.error("Invalid QRIS data structure", result);
                }
              } else {
                // Narrow down to VirtualAccountData type
                const vaResult = result.data as VirtualAccountData;
                if (vaResult.responseCode && vaResult.virtualAccountData) {
                  setVirtualAccountData(vaResult);
                } else {
                  toast.error("Invalid Virtual Account data structure", result);
                }
              }
            } else {
              toast.error("Result or result.data is undefined");
            }
          } else {
            toast.warn("orderPayments is not yet available.");
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

  if (loading) {
    return (
      <>
        <Head>
          <title>Success - Payment</title>
        </Head>
        <div className="flex h-screen items-center justify-center">
          <Loader />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Success - Payment</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
          {qrisData?.status === "02" ? (
            <h1
              aria-live="polite"
              className="mb-4 text-center text-3xl font-bold text-green-500"
            >
              Successfully
            </h1>
          ) : (
            <h1
              aria-live="polite"
              className="mb-4 text-center text-3xl font-bold"
            >
              {qrisData?.status}
            </h1>
          )}

          {virtualAccountData?.responseMessage ? (
            <h1
              aria-live="polite"
              className="mb-4 text-center text-3xl font-bold text-green-500"
            >
              {virtualAccountData?.responseMessage}
            </h1>
          ) : (
            <h1
              aria-live="polite"
              className="mb-4 text-center text-3xl font-bold"
            >
              {virtualAccountData?.responseMessage}
            </h1>
          )}

          {/* Render Items */}
          <div className="mb-6 rounded-lg bg-gray-100 p-4">
            <ul className="list-disc gap-8 pl-5">
              <li className="flex justify-between">
                <span>Payment Method</span>
                <span>
                  {qrisData
                    ? qrisData.paymentType
                    : virtualAccountData?.additionalInfo.paymentType}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Total Pembayaran</span>
                <span>
                  Rp{" "}
                  {qrisData
                    ? parseFloat(qrisData.amount || "0").toLocaleString()
                    : parseFloat(
                        virtualAccountData?.virtualAccountData.totalAmount
                          .value || "0",
                      ).toLocaleString()}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Order Id</span>
                <span>{paymentSuccess?.paymentData.orderId}</span>
              </li>
              <li className="flex justify-between">
                <span>Payment Id</span>
                <span>{paymentSuccess?.paymentData.paymentId}</span>
              </li>
              {/* {paymentSuccess?.paymentData.storeId && (
                <li className="flex justify-between">
                  <span>Store Id</span>
                  <span>{paymentSuccess?.paymentData.storeId}</span>
                </li>
              )} */}
              {virtualAccountData?.virtualAccountData.customerNo && (
                <li className="flex justify-between">
                  <span>Customer Number</span>
                  <span>
                    {virtualAccountData?.virtualAccountData.customerNo}
                  </span>
                </li>
              )}
              {/* <li className="flex justify-between">
                <span>Payer</span>
                <span>{paymentSuccess?.orderDetails.payer}</span>
              </li>
              <li className="flex justify-between">
                <span>Phone Number</span>
                <span>{paymentSuccess?.orderDetails.phoneNumber}</span>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageSuccess;
