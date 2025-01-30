import Loader from "@/components/loading";
import {
  OrderDetails,
  PaymentData,
  PaymentMethodsResponse,
} from "@/utils/order";
import { fetchPaymentMethods, processPayment } from "@/utils/payment";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PaymentPage = () => {
  const router = useRouter();
  const { data } = router.query;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodsResponse[]
  >([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    if (data) {
      const dataString = Array.isArray(data) ? data[0] : data;

      // try {
      //   const decryptedData = decryptData(dataString);
      //   setSelectedPaymentMethod(decryptedData.selectedPaymentMethod);
      //   setPaymentData(decryptedData.paymentData);
      //   // setIsModalOpen(decryptedData.isModalOpen);
      //   setIsPaymentProcessing(decryptedData.isPaymentProcessing);
      //   setIsNewLink(decryptedData.isnewLink);
      // } catch (error) {
      //   console.error("Error decrypting data:", error);
      // }

      axios
        .get(`/api/payment?data=${encodeURIComponent(dataString)}`)
        .then((response) => {
          setOrderDetails(response.data);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || "Error fetching order data";
          toast.error(errorMessage);
        });
    }
  }, [data]);

  useEffect(() => {
    fetchPaymentMethods(setPaymentMethods, setLoading);
  }, []);

  const handlePaymentMethodSelect = (methodId: string) => {
    if (!isPaymentProcessing) {
      setSelectedPaymentMethod(methodId);
    }
  };

  // const handleCancel = () => {
  //   if (!selectedPaymentMethod) {
  //     toast.warn("Please select a payment method.", { theme: "colored" });
  //     return;
  //   }

  //   if (!orderDetails) {
  //     toast.warn("Order details is not found", { theme: "colored" });
  //     return;
  //   }

  //   cancelPayment(
  //     selectedPaymentMethod,
  //     orderDetails,
  //     paymentMethods,
  //     setIsPaymentProcessing,
  //     // setIsModalOpen,
  //     setIsNewLink,
  //     setLoading,
  //     router,
  //   );
  // };

  const handleSubmit = async () => {
    if (!selectedPaymentMethod) {
      toast.warn("Please select a payment method.", { theme: "colored" });
      return;
    }

    if (!orderDetails) {
      toast.warn("Order details is not found", { theme: "colored" });
      return;
    }

    try {
      await processPayment(
        selectedPaymentMethod,
        paymentMethods,
        orderDetails,
        setPaymentData,
        // setIsModalOpen,
        setIsPaymentProcessing,
        router,
      );
    } catch (error) {
      toast.error("Failed to process payment, please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Confirm - Payment</title>
        </Head>
        <div className="flex h-screen items-center justify-center">
          <Loader />
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Head>
          <title>Confirm - Payment</title>
        </Head>
        <div className="flex h-screen items-center justify-center">
          <p>No order detail found!</p>
        </div>
      </>
    );
  }

  const totalAmount = parseFloat(orderDetails.totalAmount);
  const fee = 10141;
  const subTotal = totalAmount + fee;

  return (
    <>
      <Head>
        <title>Confirm - Payment</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-center text-3xl font-bold">
            Confirm Payment
          </h1>
          <p className="mb-6 text-center text-gray-600">
            You will pay with the following details:
          </p>
          <div className="mb-6 rounded-lg bg-gray-100 p-4">
            <ul className="list-disc pl-5">
              {orderDetails?.items.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>Rp {parseFloat(item.price).toLocaleString()}</span>
                </li>
              ))}
              <li className="flex justify-between">
                <span>Discount</span>
                <span>Rp 0</span>
              </li>
              <li className="flex justify-between">
                <span>Fee</span>
                <span>Rp {fee.toLocaleString()}</span>
              </li>
              <li className="flex justify-between font-bold">
                <span>Sub Total</span>
                <span>Rp {subTotal.toLocaleString()}</span>
              </li>
            </ul>
          </div>

          <h2 className="mb-4 text-xl font-semibold">Select Payment Method</h2>
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map(({ category, methods }: any) => (
              <div key={category} className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">{category}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {methods.map((method: any) => (
                    <div
                      key={method._id}
                      className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-shadow hover:shadow-lg ${selectedPaymentMethod === method.name ? "border-blue-500" : "border-gray-300"}`}
                      onClick={() => handlePaymentMethodSelect(method.name)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/${method.image}`}
                        alt={method.name}
                        className="mb-2 h-5 w-16"
                      />
                      <span>{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">
                NO AVAILABLE PAYMENT METHOD
              </h3>
            </div>
          )}

          <button
            className="w-full rounded-lg bg-blue-500 py-2 font-bold text-white transition-colors hover:bg-blue-600"
            onClick={handleSubmit}
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCancel={handleCancel}
        virtualAccountNo={paymentData?.virtualAccountNo || ""}
        qrUrl={paymentData?.qrUrl || ""}
        paymentExpired={paymentData?.paymentExpired || ""}
        customerNo={paymentData?.customerNo || ""}
        paymentId={paymentData?.paymentId || ""}
        totalAmount={paymentData?.totalAmount || ""}
        orderId={paymentData?.orderId || ""}
      /> */}
    </>
  );
};

export default PaymentPage;
