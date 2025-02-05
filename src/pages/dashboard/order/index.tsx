import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import useStore from "@/store";
import formatMoney from "@/utils/helper";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlinePencil } from "react-icons/hi";
import useSWR from "swr";

const OrderPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const { data: orders, mutate: revalidate } = useSWR(
    `api/v1/orders?limit=${10}&page=${page}&query=${search}`,
  );

  useEffect(() => {
    if (orders !== undefined) {
      if (orders?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [orders]);

  return (
    <>
      <DashboardLayout>
        <Head>
          <title>Dashboard - Order</title>
        </Head>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-4 shadow dark:bg-black">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Order
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
              </div>
            </div>
            <SearchForm
              search={search}
              setSearch={setSearch}
              revalidate={revalidate}
              placeholder="name"
            />
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                        >
                          Client
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Items
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Payment Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Payment Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {empty && (
                        <tr>
                          <td
                            className="border-b border-gray-200 py-6 text-center text-sm font-normal uppercase"
                            colSpan={7}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {orders?.data?.map((order: any, idx: any) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                            {order.clientId?.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            {order.orderId}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            {order.items.map((item: any, index: any) => (
                              <div key={index}>{item.name}</div>
                            ))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            {order.paymentType}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            <span
                              className={`ml-2 inline-block rounded ${order?.paymentStatus === "paid" ? "bg-green-500" : order?.paymentStatus === "failed" ? "bg-red-500" : order?.paymentStatus === "pending" ? "bg-yellow-500" : order?.paymentStatus === "cancel" ? "bg-indigo-500" : "bg-gray-500"} px-2 py-1 text-sm font-medium text-white`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            {formatMoney(order.totalAmount)}
                          </td>
                          <td className="flex items-center justify-center gap-4 py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                            <Link href={`/dashboard/order/${order._id}`}>
                              <HiOutlinePencil className="h-5 w-5 text-blue-400" />
                            </Link>
                            {/* <HiOutlineTrash
                              className="h-5 w-5 text-rose-400"
                              onClick={(e: any) => {
                                e.stopPropagation();
                                DeleteOrder(order);
                              }}
                            /> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {!empty && (
              <div className="flex items-center justify-center border-t py-4">
                <Pagination
                  paginate={orders?.pagination || {}}
                  onPageChange={(pg) => setPage(pg)}
                  limit={1}
                />
              </div>
            )}
          </div>
          {/* <ModalOrder
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            revalidate={revalidate}
          /> */}
        </div>
      </DashboardLayout>
    </>
  );
};

export default OrderPage;
