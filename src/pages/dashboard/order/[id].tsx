import api, { handleAxiosError } from "@/api";
import { DashboardLayout } from "@/components/layout";
import useStore from "@/store";
import formatMoney from "@/utils/helper";
import { OrderInterface } from "@/utils/order";
import dayjs from "dayjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  domains: {
    name: string;
    status: string;
  }[];
};

const DetailOrderPage = () => {
  const { setIsLoading } = useStore();
  const [order, setOrder] = useState<OrderInterface>();

  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (id != undefined) {
      setIsLoading(true);
      api()
        .get("/api/v1/order/" + id)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
        })
        .catch((err) => handleAxiosError(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
  });

  return (
    <>
      <Head>
        <title>Detail - Order</title>
      </Head>
      <DashboardLayout>
        {/* <div className="">
          <Link href="/dashboard/order">
            <button
              type="button"
              className="flex justify-center items-center py-2.5 px-5 me-2 mb-2 text-sm font-bold text-white focus:outline-none bg-yellow-500 rounded-lg border border-yellow-200 hover:bg-yellow-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:border-yellow-600 dark:hover:text-white dark:hover:bg-yellow-700"
            >
              <HiChevronDoubleLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
        </div> */}
        <div className="grid grid-cols-2 gap-2">
          <div className="overflow-hidden bg-white shadow sm:rounded-lg max-h-screen">
            <div className="px-4 py-6 sm:px-6">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                Orders Detail
              </h3>
              <div className="flex justify-between">
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  Detail Orders.
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  <span>
                    Status:
                    {order?.paymentPaylabs?.status === "02" && (
                      <span className="ml-2 inline-block px-2 py-1 text-sm font-medium text-white bg-green-500 rounded">
                        Success
                      </span>
                    )}
                  </span>{" "}
                  {dayjs(order?.paymentPaylabs?.successTime).format(
                    "DD MMM YYYY"
                  )}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Order Id
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.orderId}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Merchant Trade No
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.merchantTradeNo}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">Client</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.clientId?.name}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Phone Number
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.phoneNumber}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">Items</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.items?.map((item, index) => {
                      return (
                        <div key={index}>
                          <div>ID: {item.id}</div>
                          <div>Name: {item.name}</div>
                          <div>Price: {formatMoney(item.price)}</div>
                          <div>Quantity: {item.quantity}</div>
                          <div>Type: {item.type}</div>
                        </div>
                      );
                    })}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Payment Type
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentType}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {formatMoney(order?.totalAmount)}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Created At
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {dayjs(order?.createdAt).format("DD MMM YYYY")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="overflow-auto bg-white shadow sm:rounded-lg max-h-screen">
            <div className="px-4 py-6 sm:px-6">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                Paylabs Detail
              </h3>
            </div>
            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Request Id
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.requestId}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Error Code
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.errCode}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Merchant Id
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.merchantId}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Create Time
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {dayjs(order?.paymentPaylabs?.createTime).format(
                      "DD MMM YYYY"
                    )}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Success Time
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {dayjs(order?.paymentPaylabs?.successTime).format(
                      "DD MMM YYYY"
                    )}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">Status</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.status}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Payment Method Info
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {order?.paymentPaylabs?.paymentMethodInfo ? (
                      typeof order.paymentPaylabs.paymentMethodInfo ===
                      "object" ? (
                        <ul>
                          {"nmid" in order.paymentPaylabs.paymentMethodInfo && (
                            <>
                              <li>
                                NMID:{" "}
                                {order.paymentPaylabs.paymentMethodInfo.nmid}
                              </li>
                              <li>
                                RRN:{" "}
                                {order.paymentPaylabs.paymentMethodInfo.rrn}
                              </li>
                            </>
                          )}
                          {"vaCode" in
                            order.paymentPaylabs.paymentMethodInfo && (
                            <li>
                              VA Code:{" "}
                              {order.paymentPaylabs.paymentMethodInfo.vaCode}
                            </li>
                          )}
                          {"paymentCode" in
                            order.paymentPaylabs.paymentMethodInfo && (
                            <li>
                              Payment Code:{" "}
                              {
                                order.paymentPaylabs.paymentMethodInfo
                                  .paymentCode
                              }
                            </li>
                          )}
                          {"payer" in
                            order.paymentPaylabs.paymentMethodInfo && (
                            <li>
                              Payer:{" "}
                              {order.paymentPaylabs.paymentMethodInfo.payer}
                            </li>
                          )}
                          {"phoneNumber" in
                            order.paymentPaylabs.paymentMethodInfo && (
                            <li>
                              Phone Number:{" "}
                              {
                                order.paymentPaylabs.paymentMethodInfo
                                  .phoneNumber
                              }
                            </li>
                          )}
                          {"issuerId" in
                            order.paymentPaylabs.paymentMethodInfo && (
                            <li>
                              Issuer ID:{" "}
                              {order.paymentPaylabs.paymentMethodInfo.issuerId}
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span>{order.paymentPaylabs.paymentMethodInfo}</span>
                      )
                    ) : (
                      <span>No Payment Method Info Available</span>
                    )}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Trans Fee Rate
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {formatMoney(order?.paymentPaylabs?.transFeeRate)}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Trans Fee Amount
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {formatMoney(order?.paymentPaylabs?.transFeeAmount)}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-900">
                    Total Trans Fee
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {formatMoney(order?.paymentPaylabs?.totalTransFee)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DetailOrderPage;
