// utils/paymentUtils.ts
import { encryptData } from "@/utils/encryption";
import { createSignatureForward } from "@/utils/paylabs";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { handleAxiosError } from "./errorHandling";
import { OrderDetails, PaymentDetails, PaymentMethodsResponse } from "./order";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  closeWebSocket,
  enableWebSocketReconnect,
  initializeWebSocket,
} from "./websocket_initializer";

dayjs.extend(utc);
dayjs.extend(timezone);

export const fetchPaymentMethods = async (
  setPaymentMethods: (methods: any) => void,
  setLoading: (loading: boolean) => void,
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/available-payment`,
    );
    if (response.data.success) {
      const groupedMethods = response.data.data.reduce(
        (acc: any, method: any) => {
          if (method.active) {
            if (!acc[method.category]) {
              acc[method.category] = [];
            }
            acc[method.category].push(method);
          }
          return acc;
        },
        {},
      );

      if (groupedMethods["QRIS"]) {
        const qrisMethods = groupedMethods["QRIS"];
        delete groupedMethods["QRIS"];
        groupedMethods["QRIS"] = qrisMethods;
      }

      const methodsArray = Object.entries(groupedMethods).map(
        ([category, methods]) => ({
          category,
          methods,
        }),
      );

      const sortedMethodsArray = methodsArray.sort((a) =>
        a.category === "QRIS" ? -1 : 1,
      );
      setPaymentMethods(sortedMethodsArray);
    }
  } catch (error) {
    handleAxiosError(error);
  } finally {
    setLoading(false);
  }
};

export const processPayment = async (
  selectedPaymentMethod: string,
  paymentMethod: PaymentMethodsResponse[],
  orderDetails: OrderDetails,
  setPaymentData: (data: any) => void,
  setIsPaymentProcessing: (isProcessing: boolean) => void,
  router: any,
  onSuccess?: (data: any, link: any) => void,
  onFailure?: (error: any) => void,
) => {
  if (!selectedPaymentMethod) {
    toast.warn("Please select a payment method.", { theme: "colored" });
    return;
  }

  const selectedMethod = paymentMethod
    .flatMap(({ methods }: any) => methods)
    .find((method: any) => method.name === selectedPaymentMethod);

  if (!selectedMethod) {
    toast.warn("Selected payment method not found.", { theme: "colored" });
    return;
  }

  const { clientId, expired, payer, ...updatedOrderDetails } = {
    ...orderDetails,
    paymentType: selectedMethod.name,
  };

  const formattedTimestamp = dayjs()
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

  const endpointUrl =
    selectedMethod.category === "QRIS"
      ? `/api/v1/order/create/qris`
      : `/api/v1/order/create/va/snap`;

  const signature = createSignatureForward(
    "POST",
    endpointUrl,
    updatedOrderDetails,
    formattedTimestamp,
  );

  try {
    setIsPaymentProcessing(true);

    const headers = {
      "x-signature": signature,
      "x-partner-id": clientId,
      "x-timestamp": formattedTimestamp,
    };

    // const response = await axios.post(
    //   `${process.env.NEXT_PUBLIC_CLIENT_API_URL}${endpointUrl}`,
    //   updatedOrderDetails,
    //   { headers },
    // );

    const response =
      selectedMethod.category === "QRIS"
        ? {
            data: {
              success: true,
              qrCode: "MOCK-QRIS:2025011745400000016",
              qrUrl:
                "https://sit-payer.paylabs.co.id/payer-api/qr?4f945bfd41dace9626fb4586ef30980bMOCK-QRIS%3A2025011745400000016",
              paymentExpired: "20250306093933",
              paymentId: "PL-288adc8f48c7ec45",
              storeId: "010454S00001",
              totalAmount: "20141",
              orderId: "CLNT1234520250305803",
              id: "6791a4956140fa6f98ea7acf",
            },
          }
        : {
            data: {
              success: true,
              partnerServiceId: "  010454",
              customerNo: "20250120203595732591",
              virtualAccountNo: "8780197401241500",
              totalAmount: "10000",
              paymentExpired: "2025-01-25T18:38:16+07:00",
              paymentId: "PL-891564cc0d471e48",
              storeId: "010454S00001",
              orderId: "CLNT1234520250305803",
              id: "678def593ba7120a1fb86995",
            },
          };

    if (!response.data.success) {
      if (onFailure) onFailure("Failed to process payment. Please try again.");
      return;
    }

    toast.success("Order created successfully!", { theme: "colored" });

    setPaymentData(response.data);

    const encryptedData = encryptData({
      isPaymentProcessing: true,
      selectedPaymentMethod,
      paymentMethods: paymentMethod,
      orderDetails: orderDetails,
      paymentData: {
        virtualAccountNo: response.data.virtualAccountNo,
        customerNo: response.data.customerNo,
        qrUrl: response.data.qrUrl,
        paymentExpired: response.data.paymentExpired,
        paymentId: response.data.paymentId,
        totalAmount: response.data.totalAmount,
        storeId: response.data.storeId,
        orderId: response.data.orderId,
        id: response.data.id,
      },
    });

    const newLink = `${window.location.origin}/payment/process?q=${encodeURIComponent(encryptedData)}`;

    if (onSuccess) {
      onSuccess(response.data, newLink);
      router.push(newLink);
    }
  } catch (error) {
    handleAxiosError(error);
    if (onFailure) onFailure(error);
  } finally {
    setIsPaymentProcessing(false);
  }
};

export const cancelPayment = async (
  selectedPaymentMethod: string,
  paymentDetails: PaymentDetails,
  paymentMethod: PaymentMethodsResponse[],
  setIsPaymentProcessing: (isProcessing: boolean) => void,
  //   setIsModalOpen: (isOpen: boolean) => void,
  // setIsNewLink: (isNew: boolean) => void,
  setLoading: (loading: boolean) => void,
  router: any,
  onSuccess?: (data: any) => void,
  onFailure?: (error: any) => void,
) => {
  if (!selectedPaymentMethod) {
    toast.warn("Please select a payment method.", { theme: "colored" });
    return;
  }

  if (
    !paymentDetails ||
    !paymentDetails.paymentData ||
    !paymentDetails.paymentData.id
  ) {
    toast.error(
      "Invalid payment details. Please check your payment information.",
      { theme: "colored" },
    );
    return;
  }

  const selectedMethod = paymentMethod
    .flatMap(({ methods }: any) => methods)
    .find((method: any) => method.name === selectedPaymentMethod);

  if (!selectedMethod) {
    toast.warn("Selected payment method not found.", { theme: "colored" });
    return;
  }

  const clientId = paymentDetails.orderDetails.clientId;

  const formattedTimestamp = dayjs()
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const endpointUrl =
    selectedMethod.category === "QRIS"
      ? `/api/v1/order/cancel/qris/${paymentDetails.paymentData.id}`
      : `/api/v1/order/delete/va/snap/${paymentDetails.paymentData.id}`;

  const signature =
    selectedMethod.category === "QRIS"
      ? createSignatureForward("POST", endpointUrl, {}, formattedTimestamp)
      : createSignatureForward("DELETE", endpointUrl, {}, formattedTimestamp);

  try {
    setLoading(true);

    const headers = {
      "x-signature": signature,
      "x-partner-id": clientId,
      "x-timestamp": formattedTimestamp,
    };

    let response;
    if (selectedMethod.category === "QRIS") {
      response = await axios.post(
        `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/cancel/qris/${paymentDetails.paymentData.id}`,
        {},
        { headers },
      );
    } else if (selectedMethod.category === "VIRTUAL ACCOUNT") {
      response = await axios.delete(
        `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/delete/va/snap/${paymentDetails.paymentData.id}`,
        { headers },
      );
    }

    if (
      (selectedMethod.category === "QRIS" && response?.data.errCode === "0") ||
      (selectedMethod.category === "VIRTUAL ACCOUNT" &&
        response?.data.responseCode === "2003100")
    ) {
      const encryptedData = encryptData({
        clientId: paymentDetails.orderDetails.clientId,
        items: paymentDetails.orderDetails.items,
        payer: paymentDetails.orderDetails.payer,
        paymentMethod: paymentDetails.orderDetails.paymentMethod,
        phoneNumber: paymentDetails.orderDetails.phoneNumber,
        totalAmount: paymentDetails.orderDetails.totalAmount,
        expired: Math.floor((Date.now() + 30 * 60 * 1000) / 1000),
      });

      const newLink = `${window.location.origin}/payment?q=${encodeURIComponent(encryptedData)}`;
      //   console.log("New Link:", newLink);
      router.push(newLink);

      enableWebSocketReconnect(); // ✅ Aktifkan reconnect setelah cancelPayment
      setTimeout(() => {
        console.log("🔄 Restarting WebSocket after cancelPayment...");
        initializeWebSocket(process.env.NEXT_PUBLIC_WS_URL as string, true);
      }, 1000);
      if (onSuccess) onSuccess(response.data);
      toast.warn("PAYMENT CANCELED", { theme: "colored" });
      setIsPaymentProcessing(false);
      // setIsNewLink(false);
      //   setIsModalOpen(false);
    } else {
      if (onFailure) onFailure("Failed to cancel payment. Please try again.");
      throw new Error("Failed to cancel payment. Please try again.");
    }
  } catch (error) {
    handleAxiosError(error);
    toast.error(
      "An error occurred while processing your payment cancellation.",
      { theme: "colored" },
    );
    if (onFailure) onFailure(error);
  } finally {
    setLoading(false);
  }
};

export const successPayment = async (
  id: string,
  clientId: string,
  paymentMethod: PaymentMethodsResponse[],
  selectedPaymentMethod: string,
  setLoading: (loading: boolean) => void,
  onSuccess?: (data: any) => void,
  onFailure?: (error: any) => void,
) => {
  const selectedMethod = paymentMethod
    .flatMap(({ methods }: any) => methods)
    .find((method: any) => method.name === selectedPaymentMethod);

  if (!selectedMethod) {
    toast.warn("Selected payment method not found.", { theme: "colored" });
    return;
  }

  const formattedTimestamp = dayjs()
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const endpointUrl =
    selectedMethod.category === "QRIS"
      ? `/api/v1/order/status/qris/${id}`
      : `/api/v1/order/status/va/snap/${id}`;

  const signature = createSignatureForward(
    "GET",
    endpointUrl,
    {},
    formattedTimestamp,
  );

  try {
    setLoading(true);

    const headers = {
      "x-signature": signature,
      "x-partner-id": clientId,
      "x-timestamp": formattedTimestamp,
    };

    let response;
    if (selectedMethod.category === "QRIS") {
      response = await axios.get(
        `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/status/qris/${id}`,
        { headers },
      );
    } else if (selectedMethod.category === "VIRTUAL ACCOUNT") {
      response = await axios.get(
        `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/v1/order/status/va/snap/${id}`,
        { headers },
      );
    }

    if (
      (selectedMethod.category === "QRIS" && response?.data.status === "02") ||
      (selectedMethod.category === "VIRTUAL ACCOUNT" &&
        response?.data.responseCode === "2002600")
    ) {
      if (onSuccess) onSuccess(response.data);
      closeWebSocket();
      return { data: response.data };
    } else {
      if (onFailure) onFailure("Failed to payment. Please try again.");
      throw new Error("Failed to payment. Please try again.");
    }
  } catch (error) {
    handleAxiosError(error);
    toast.error("An error occurred while processing your payment.", {
      theme: "colored",
    });
    if (onFailure) onFailure(error);
  } finally {
    setLoading(false);
  }
};
