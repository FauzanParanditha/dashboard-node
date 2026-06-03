import api, { handleAxiosError } from "@/api";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout/";
import Pagination from "@/components/pagination";
import { useAuthGuard } from "@/hooks/use-auth";
import useStore from "@/store";
import LogDetailModal from "@/components/dashboard/logs/LogDetailModal";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

const MAX_RETRY = 7;
const RETRY_TIMEOUT_MS = 60 * 60 * 1000;

type StatusKey = "pending" | "processing" | "failed" | "dead";

const STATUS_BADGE: Record<StatusKey, { bg: string; text: string; label: (n: number) => string }> = {
  pending:    { bg: "bg-blue-100",   text: "text-blue-700",   label: () => "Pending" },
  processing: { bg: "bg-yellow-100", text: "text-yellow-700", label: () => "Processing..." },
  failed:     { bg: "bg-orange-100", text: "text-orange-700", label: (n) => `Failed (${n}/${MAX_RETRY})` },
  dead:       { bg: "bg-red-100",    text: "text-red-700",    label: (n) => `Dead (${n}/${MAX_RETRY})` },
};

function StatusBadge({ status, retryCount }: { status: string; retryCount: number }) {
  const cfg = STATUS_BADGE[status as StatusKey] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: () => status,
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label(retryCount)}
    </span>
  );
}

const LogFailedCallbackPage = () => {
  useAuthGuard(["log:retry"]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<{ title: string; content: string } | null>(null);

  const { data: callback, mutate: revalidate } = useSWR(
    "api/v1/adm/failed-callbacklogs?perPage=10&page=" + page + "&query=" + search,
  );

  useEffect(() => {
    setIsLoading(true);
    if (callback !== undefined) {
      setEmpty(!callback?.data?.length);
      setIsLoading(false);
    }
  }, [callback]);

  const setRowRetrying = (id: string, val: boolean) =>
    setRetrying((prev) => ({ ...prev, [id]: val }));

  const handleRetryResponse = (res: any, id: string) => {
    const status = res.status;
    if (status === 200) {
      toast.success("Retry berhasil.", { theme: "colored" });
    } else if (status === 202) {
      toast.warning("Semua percobaan retry gagal. Cek errDesc untuk detail.", { theme: "colored" });
    } else {
      toast.info(res.data?.message || "Retry selesai.", { theme: "colored" });
    }
  };

  const handleRetryError = (err: any) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message;
    if (status === 404) {
      toast.info("Sedang diproses, coba refresh dulu.", { theme: "colored" });
    } else if (status === 410) {
      toast.error("Sudah mencapai batas max retry. Gunakan Force Retry.", { theme: "colored" });
    } else if (status === 400) {
      toast.error(message || "Request tidak valid.", { theme: "colored" });
    } else if (status === 500) {
      toast.error("Server error — tim ops sudah dinotifikasi.", { theme: "colored" });
    } else {
      handleAxiosError(err);
    }
  };

  const retryCallback = (dt: any) => {
    const id = dt._id;
    Swal.fire({
      title: "Retry callback?",
      text: "Sistem akan mencoba mengirim ulang callback ke merchant.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "Retry",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (!result.isConfirmed) return;
      setRowRetrying(id, true);
      api()
        .post("/api/v1/adm/retry/callback/" + id, {}, { timeout: RETRY_TIMEOUT_MS })
        .then((res) => handleRetryResponse(res, id))
        .catch(handleRetryError)
        .finally(() => {
          setRowRetrying(id, false);
          revalidate({}, true);
        });
    });
  };

  const forceRetryCallback = (dt: any) => {
    const id = dt._id;
    Swal.fire({
      title: "Force Retry?",
      html:
        "<div class='text-left text-sm space-y-1'>" +
        "<p>Force Retry akan:</p>" +
        "<ul class='list-disc pl-5 mt-1 space-y-1'>" +
        "<li>Reset retry counter dari 7 ke 0</li>" +
        "<li>Bypass batas maksimum retry</li>" +
        "<li>Mencatat audit log + alert Discord ke tim ops</li>" +
        "</ul>" +
        "<p class='mt-2 text-slate-500'>Error history sebelumnya tetap dipertahankan untuk referensi.</p>" +
        "</div>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "Ya, Force Retry",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (!result.isConfirmed) return;
      setRowRetrying(id, true);
      api()
        .post("/api/v1/adm/retry/callback/" + id + "?force=true", {}, { timeout: RETRY_TIMEOUT_MS })
        .then((res) => handleRetryResponse(res, id))
        .catch(handleRetryError)
        .finally(() => {
          setRowRetrying(id, false);
          revalidate({}, true);
        });
    });
  };

  return (
    <>
      <Head>
        <title>Failed Callback List</title>
      </Head>
      <DashboardLayout>
        <div className="animate-fade-down container mx-auto my-6 rounded bg-white p-5 text-slate-700 shadow dark:bg-black dark:text-white sm:p-6">
          <div className="px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Failed Callback
                </h1>
              </div>
            </div>
            <div className="mt-6 max-w-md">
              <SearchForm
                search={search}
                setSearch={setSearch}
                revalidate={revalidate}
                placeholder="Name"
              />
            </div>
          </div>

          <div className="container mx-auto">
            <div className="py-1">
              <div className="py-2">
                <div className="max-w-full overflow-x-auto rounded-lg">
                  <table className="w-full leading-normal text-slate-500 dark:text-white">
                    <thead>
                      <tr>
                        <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Client</th>
                        <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Error / Callback</th>
                        <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Status</th>
                        <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Created At</th>
                        <th className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase">Action</th>
                        <th className="border-b border-gray-200 px-5 py-3 text-center text-sm font-normal uppercase">Detail</th>
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
                      {callback?.data?.map((dt: any, index: number) => {
                        const isRetrying = !!retrying[dt._id];
                        return (
                          <tr key={index} className="border-b">
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              {dt.client?.name ?? "-"}
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              {dt.errDesc && (
                                <div className="max-w-[320px] truncate text-rose-500">
                                  {dt.errDesc}
                                </div>
                              )}
                              <div className="max-w-[320px] truncate text-xs text-slate-400">
                                {dt.callbackUrl}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm">
                              <StatusBadge status={dt.status} retryCount={dt.retryCount ?? 0} />
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <p className="whitespace-nowrap">
                                {dayjs(dt.createdAt).format("DD-MM-YYYY HH:mm")}
                              </p>
                            </td>
                            <td className="border-gray-200 p-5 text-sm">
                              {(dt.status === "failed" || dt.status === "pending") && (
                                <button
                                  disabled={isRetrying}
                                  onClick={() => retryCallback(dt)}
                                  className="flex items-center gap-1 rounded bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isRetrying ? (
                                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  )}
                                  {isRetrying ? "Retrying..." : "Retry"}
                                </button>
                              )}
                              {dt.status === "dead" && (
                                <button
                                  disabled={isRetrying}
                                  onClick={() => forceRetryCallback(dt)}
                                  className="flex items-center gap-1 rounded bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isRetrying ? (
                                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                  )}
                                  {isRetrying ? "Processing..." : "Force Retry"}
                                </button>
                              )}
                            </td>
                            <td className="border-gray-200 p-5 text-center text-sm dark:text-white">
                              <button
                                className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                                onClick={() => {
                                  const payload =
                                    typeof dt.payload === "string"
                                      ? dt.payload
                                      : JSON.stringify(dt.payload, null, 2);
                                  setDetail({
                                    title: "Failed Callback Detail",
                                    content: `Status: ${dt.status} (${dt.retryCount ?? 0}/${MAX_RETRY})\n\nError:\n${dt.errDesc || "-"}\n\nCallback URL:\n${dt.callbackUrl}\n\nPayload:\n${payload}`,
                                  });
                                }}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="m-5 flex justify-center">
                {!empty && (
                  <Pagination
                    paginate={callback?.pagination || {}}
                    onPageChange={(pg) => setPage(pg)}
                    limit={1}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <LogDetailModal
        isOpen={!!detail}
        title={detail?.title || ""}
        content={detail?.content || ""}
        onClose={() => setDetail(null)}
      />
    </>
  );
};

export default LogFailedCallbackPage;
