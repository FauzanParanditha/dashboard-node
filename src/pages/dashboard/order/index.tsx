import api, { handleAxiosError } from "@/api";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import { useAuthGuard } from "@/hooks/use-auth";
import useStore from "@/store";
import formatMoney from "@/utils/helper";
import { jwtConfig } from "@/utils/var";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HiEye } from "react-icons/hi";
import useSWR from "swr";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const statusOptions = ["paid", "pending", "expired", "cancel"];

const OrderPage = () => {
  useAuthGuard();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [clientId, setClientId] = useState("");
  const [domain, setDomain] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [groupByClient, setGroupByClient] = useState(false);
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [role, setRole] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole =
      localStorage.getItem(jwtConfig.admin.roleName) ||
      localStorage.getItem(jwtConfig.user.roleName) ||
      "";
    setRole(storedRole);
  }, []);

  const isAdmin = String(role || "")
    .toLowerCase()
    .includes("admin");
  const isFinance = String(role || "")
    .toLowerCase()
    .includes("finance");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (groupByClient) {
      params.set("group_by", "client");
    } else {
      params.set("page", String(page));
      params.set("limit", String(limit));
    }
    if (clientId.trim()) params.set("clientId", clientId.trim());
    if (domain.trim()) params.set("domain", domain.trim());
    if (statuses.length > 0) params.set("paymentStatus", statuses.join(","));
    if (dateRange[0]) params.set("dateFrom", dateRange[0].toISOString());
    if (dateRange[1]) params.set("dateTo", dateRange[1].toISOString());
    return params.toString();
  }, [clientId, domain, statuses, dateRange, page, limit, groupByClient]);

  const { data: orders, mutate: revalidate } = useSWR(
    `api/v1/orders?${queryString}`,
  );

  useEffect(() => {
    if (!groupByClient) {
      setPage(1);
    }
  }, [clientId, domain, statuses, dateRange, groupByClient, limit]);

  useEffect(() => {
    if (orders !== undefined) {
      if (orders?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [orders]);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {
        sort_by: "createdAt",
        sort: "-1",
      };
      if (clientId.trim()) params.clientId = clientId.trim();
      if (domain.trim()) params.domain = domain.trim();
      if (statuses.length > 0) params.paymentStatus = statuses.join(",");
      if (dateRange[0]) params.dateFrom = dateRange[0].toISOString();
      if (dateRange[1]) params.dateTo = dateRange[1].toISOString();
      if (groupByClient) params.group_by = "client";

      const res = await api().get("/api/v1/orders/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(isAdmin || isFinance) && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="CLNT-001"
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                    Date Range
                  </label>
                  <div className="mt-1">
                    <DatePicker.RangePicker
                      showTime={false}
                      showNow={false}
                      needConfirm={false}
                      value={dateRange}
                      onChange={(range) => setDateRange(range ?? [null, null])}
                      className="w-full"
                      allowClear
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                  Payment Status
                </div>
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={statuses.includes(status)}
                      onChange={(e) => {
                        setStatuses((prev) =>
                          e.target.checked
                            ? [...prev, status]
                            : prev.filter((s) => s !== status),
                        );
                      }}
                    />
                    {status}
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={groupByClient}
                    onChange={(e) => setGroupByClient(e.target.checked)}
                  />
                  Group by client
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                    Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value || 1))}
                    className="w-20 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-black dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
                    onClick={handleExport}
                  >
                    Export XLSX
                  </button>
                  <button
                    className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                    onClick={() => {
                      setClientId("");
                      setDomain("");
                      setStatuses([]);
                      setDateRange([null, null]);
                      setGroupByClient(false);
                      setLimit(20);
                      setPage(1);
                      revalidate();
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500"
                    onClick={() => {
                      setPage(1);
                      revalidate();
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    {groupByClient ? (
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Client
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Total Orders
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                    ) : (
                      <thead>
                        <tr>
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
                            Domain Name
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
                    )}
                    <tbody className="divide-y divide-gray-200">
                      {empty && (
                        <tr>
                          <td
                            className="border-b border-gray-200 py-6 text-center text-sm font-normal uppercase"
                            colSpan={groupByClient ? 3 : 7}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {groupByClient
                        ? orders?.data?.map((row: any, idx: any) => {
                            const clientLabel =
                              row?.client?.name ||
                              row?.clientName ||
                              row?.clientId ||
                              row?.client_id ||
                              "-";
                            const totalOrders =
                              row?.totalOrders ??
                              row?.count ??
                              row?.total ??
                              "-";
                            const rawAmount =
                              row?.totalAmount ??
                              row?.amount ??
                              row?.totalAmountPaid;
                            const totalAmount =
                              typeof rawAmount === "number"
                                ? formatMoney(rawAmount)
                                : rawAmount || "-";
                            return (
                              <tr key={idx}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                                  {clientLabel}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                  {totalOrders}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                  {totalAmount}
                                </td>
                              </tr>
                            );
                          })
                        : orders?.data?.map((order: any, idx: any) => (
                            <tr key={idx}>
                              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                                <div>{order.orderId}</div>
                                <div className="text-xs text-slate-400">
                                  {order.clientId?.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {order.items?.length || 0} items
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500 dark:text-white">
                                {order.items?.[0]?.domain || "-"}
                                {order.items?.length > 1 && (
                                  <span className="ml-2 text-xs text-slate-400">
                                    +{order.items.length - 1} more
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                {order.paymentType}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                <span
                                  className={`ml-2 inline-block rounded ${order?.paymentStatus === "paid" ? "bg-green-500" : order?.paymentStatus === "pending" ? "bg-yellow-500" : order?.paymentStatus === "cancel" ? "bg-red-700" : "bg-gray-500"} px-2 py-1 text-sm font-medium text-white`}
                                >
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                {formatMoney(order.totalAmount)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500 dark:text-white">
                                <Link
                                  href={`/dashboard/order/${order._id}`}
                                  className="inline-flex items-center justify-center"
                                >
                                  <HiEye className="h-5 w-5 text-blue-400" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {!empty && !groupByClient && (
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
