import api, { handleAxiosError } from "@/api";
import LogDetailModal from "@/components/dashboard/logs/LogDetailModal";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import { useAuthGuard } from "@/hooks/use-auth";
import { useRBAC } from "@/hooks/use-rbac";
import useStore from "@/store";
import clsx from "clsx";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import { HiOutlineLockOpen } from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

const formatLockedUntil = (until: number | null) => {
  if (until == null) return "-";
  if (until >= Number.MAX_SAFE_INTEGER) return "Permanent";
  return dayjs(until).format("DD MMM YYYY HH:mm");
};

const BlockedIpPage = () => {
  useAuthGuard(["blocked_ip:list"]);
  const { setIsLoading } = useStore();
  const { hasPermission } = useRBAC();
  const canManage = hasPermission("blocked_ip:manage");

  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const [empty, setEmpty] = useState(true);
  const [detail, setDetail] = useState<{ title: string; content: string } | null>(null);

  const { data: resp, mutate: revalidate } = useSWR(
    `api/v1/adm/blocked-ips?activeOnly=${activeOnly}&limit=20&page=${page}`,
  );

  const items = resp?.data?.items ?? [];
  const pagination = resp?.data?.pagination;

  useEffect(() => {
    if (resp !== undefined) {
      setEmpty(!items.length);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [resp]);

  const handleActiveOnlyChange = (value: boolean) => {
    setActiveOnly(value);
    setPage(1);
  };

  // Fetch history + endpoint stats + recent probes and show them in the modal.
  const openDetail = async (ip: string) => {
    setIsLoading(true);
    try {
      const [history, endpoints, requests] = await Promise.all([
        api().get(`api/v1/adm/blocked-ips/${encodeURIComponent(ip)}`),
        api().get(`api/v1/adm/blocked-ips/${encodeURIComponent(ip)}/endpoints`),
        api().get(`api/v1/adm/blocked-ips/${encodeURIComponent(ip)}/requests?limit=50`),
      ]);
      const content = [
        "=== BLOCK HISTORY ===",
        JSON.stringify(history.data?.data ?? [], null, 2),
        "",
        "=== ENDPOINTS PROBED (aggregated) ===",
        JSON.stringify(endpoints.data?.data ?? [], null, 2),
        "",
        "=== RECENT REQUESTS (post-block, max 50) ===",
        JSON.stringify(requests.data?.data ?? [], null, 2),
      ].join("\n");
      setDetail({ title: `Detail — ${ip}`, content });
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const unblockIp = (ip: string) => {
    Swal.fire({
      title: "Unblock IP ini?",
      input: "text",
      inputLabel: "Alasan unblock (wajib)",
      inputPlaceholder: "mis. false positive / sudah diinvestigasi",
      inputValidator: (value) => (!value ? "Alasan wajib diisi" : undefined),
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "Unblock",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (!result.isConfirmed) return;
      setIsLoading(true);
      api()
        .post(`api/v1/adm/blocked-ips/${encodeURIComponent(ip)}/unblock`, {
          reason: result.value,
        })
        .then((res) => {
          if (res.data.success) {
            revalidate({}, true);
            toast.success("IP berhasil di-unblock", { theme: "colored" });
          }
        })
        .catch(handleAxiosError)
        .finally(() => setIsLoading(false));
    });
  };

  const manualBlock = () => {
    Swal.fire({
      title: "Block IP manual",
      html:
        '<input id="swal-ip" class="swal2-input" placeholder="IP address (mis. 154.18.187.124)">' +
        '<input id="swal-reason" class="swal2-input" placeholder="Alasan block">' +
        '<label class="mt-2 flex items-center justify-center gap-2 text-sm"><input id="swal-permanent" type="checkbox"> Permanent</label>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "Block",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const ip = (document.getElementById("swal-ip") as HTMLInputElement)?.value?.trim();
        const reason = (document.getElementById("swal-reason") as HTMLInputElement)?.value?.trim();
        const permanent = (document.getElementById("swal-permanent") as HTMLInputElement)?.checked;
        if (!ip) {
          Swal.showValidationMessage("IP address wajib diisi");
          return false;
        }
        if (!reason) {
          Swal.showValidationMessage("Alasan wajib diisi");
          return false;
        }
        return { ip, reason, permanent };
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      const { ip, reason, permanent } = result.value as {
        ip: string;
        reason: string;
        permanent: boolean;
      };
      setIsLoading(true);
      api()
        .post(`api/v1/adm/blocked-ips/${encodeURIComponent(ip)}/block`, {
          reason,
          permanent,
        })
        .then((res) => {
          if (res.data.success) {
            revalidate({}, true);
            toast.success("IP berhasil di-block", { theme: "colored" });
          }
        })
        .catch(handleAxiosError)
        .finally(() => setIsLoading(false));
    });
  };

  return (
    <>
      <Head>
        <title>Blocked IP List</title>
      </Head>
      <DashboardLayout>
        <div className="animate-fade-down container mx-auto my-6 rounded bg-white p-5 text-slate-700 shadow dark:bg-black dark:text-white sm:p-6">
          <div className="px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                Blocked IP
              </h1>
              {canManage && (
                <button
                  type="button"
                  onClick={manualBlock}
                  className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                >
                  Block IP Manual
                </button>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="active-filter" className="sr-only">
                Filter
              </label>
              <select
                id="active-filter"
                value={activeOnly ? "active" : "all"}
                onChange={(e) => handleActiveOnlyChange(e.target.value === "active")}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800 dark:border-gray-600 dark:bg-black dark:text-white"
              >
                <option value="active">Active only</option>
                <option value="all">All (incl. history)</option>
              </select>
            </div>
          </div>

          <div className="container mx-auto">
            <div className="py-2">
              <div className="max-w-full overflow-x-auto rounded-lg">
                <table className="w-full leading-normal text-slate-500 dark:text-white">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">IP Address</th>
                      <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Reason</th>
                      <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Offense</th>
                      <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Status</th>
                      <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Blocked Until</th>
                      <th className="border-b border-gray-200 px-5 py-3 text-center text-sm font-normal uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    {empty && (
                      <tr>
                        <td className="border-b border-gray-200 py-6 text-center text-sm font-normal uppercase" colSpan={6}>
                          Data Not Found
                        </td>
                      </tr>
                    )}
                    {items.map((dt: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="border-gray-200 p-5 text-sm font-medium text-slate-700 dark:text-white">
                          {dt.ipAddress}
                        </td>
                        <td className="border-gray-200 p-5 text-sm">{dt.reason}</td>
                        <td className="border-gray-200 p-5 text-sm">{dt.offenseCount}</td>
                        <td className="border-gray-200 p-5 text-sm">
                          <span
                            className={clsx(
                              "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                              dt.isActive
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {dt.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="border-gray-200 p-5 text-sm">
                          {dt.isActive ? formatLockedUntil(dt.blockedUntil) : "-"}
                        </td>
                        <td className="border-gray-200 p-5 text-center text-sm">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => openDetail(dt.ipAddress)}
                              className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                            >
                              Detail
                            </button>
                            {canManage && dt.isActive && (
                              <HiOutlineLockOpen
                                className="h-5 w-5 cursor-pointer text-amber-500"
                                title="Unblock IP"
                                onClick={() => unblockIp(dt.ipAddress)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!empty && pagination && (
              <div className="flex items-center justify-center border-t py-4">
                <Pagination
                  paginate={{
                    currentPage: page,
                    totalPages: pagination.totalPages ?? 1,
                    perPage: pagination.limit ?? 20,
                    totalRecords: pagination.total ?? 0,
                    recordsOnPage: items.length,
                  }}
                  onPageChange={(pg) => setPage(pg)}
                  limit={1}
                />
              </div>
            )}
          </div>
        </div>
        <LogDetailModal
          isOpen={!!detail}
          title={detail?.title ?? ""}
          content={detail?.content ?? ""}
          onClose={() => setDetail(null)}
        />
      </DashboardLayout>
    </>
  );
};

export default BlockedIpPage;
