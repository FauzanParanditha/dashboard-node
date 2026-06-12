import api, { handleAxiosError } from "@/api";
import SearchForm from "@/components/form/search";
import SelectField from "@/components/form/select";
import { DashboardLayout } from "@/components/layout/";
import Pagination from "@/components/pagination";
import { useAuthGuard } from "@/hooks/use-auth";
import useStore from "@/store";
import LogDetailModal from "@/components/dashboard/logs/LogDetailModal";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";

// Format any value as pretty JSON for the detail view.
const fmt = (v: unknown) =>
  typeof v === "string" ? v : JSON.stringify(v ?? null, null, 2);

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const LogCallbackPage = () => {
  useAuthGuard(["log:callback"]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [detail, setDetail] = useState<{ title: string; content: string } | null>(
    null,
  );
  const [clientId, setClientId] = useState("");
  const [clientOptions, setClientOptions] = useState<
    { label: string; value: string }[]
  >([{ label: "All clients", value: "" }]);

  const { data: callback, mutate: revalidate } = useSWR(
    "api/v1/adm/callbacklogs?perPage=10&page=" +
      page +
      "&query=" +
      search +
      (clientId ? "&clientId=" + clientId : ""),
  );

  // Load clients for the filter dropdown.
  useEffect(() => {
    api()
      .get("api/v1/client?limit=1000&page=1")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setClientOptions([
            { label: "All clients", value: "" },
            ...res.data.data.map((c: any) => ({
              label: c.name,
              value: c._id,
            })),
          ]);
        }
      })
      .catch(handleAxiosError);
  }, []);
  useEffect(() => {
    setIsLoading(true);
    if (callback !== undefined) {
      if (callback?.data?.length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
        setIsLoading(true);
      }
      setIsLoading(false);
    }
  }, [callback]);

  return (
    <>
      <Head>
        <title>Callback List</title>
      </Head>
      <DashboardLayout>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-5 text-slate-700 shadow dark:bg-black dark:text-white sm:p-6">
          <div className="px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Callback
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div className="max-w-md flex-1">
                <SearchForm
                  search={search}
                  setSearch={setSearch}
                  revalidate={revalidate}
                  placeholder="Name"
                />
              </div>
              <div className="w-full sm:w-64">
                <SelectField
                  name="clientId"
                  label="Filter by Client"
                  options={clientOptions}
                  value={clientId}
                  onChange={(value: string) => {
                    setClientId(value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="container mx-auto">
            <div className="py-1">
              <div className="py-2">
                <div className="max-w-full overflow-x-auto rounded-lg">
                  <table className="w-full leading-normal text-slate-500 dark:text-white">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Source
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Target
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Payload / Response
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Created_at
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-center text-sm font-normal uppercase"
                        >
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
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
                      {callback?.data?.map((dt: any, index: any) => {
                        return (
                          <tr key={index} className="border-b">
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">{dt.type}</div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.source}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.target}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.statusCode ?? "-"}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="max-w-[320px] truncate">
                                {typeof dt.payload === "string"
                                  ? dt.payload
                                  : JSON.stringify(dt.payload)}
                              </div>
                              <div className="max-w-[320px] truncate text-xs text-slate-400">
                                {typeof dt.response === "string"
                                  ? dt.response
                                  : JSON.stringify(dt.response)}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <p className="whitespace-nowrap">
                                {dayjs(dt.createdAt).format("DD-MM-YYYY")}
                              </p>
                            </td>
                            <td className="border-gray-200 p-5 text-center text-sm dark:text-white">
                              <button
                                className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                                onClick={() => {
                                  setDetail({
                                    title: "Callback Detail",
                                    content: [
                                      `Status Code: ${dt.statusCode ?? "-"}`,
                                      "",
                                      "Request Headers:",
                                      fmt(dt.requestHeaders),
                                      "",
                                      "Response Headers:",
                                      fmt(dt.responseHeaders),
                                      "",
                                      "Payload:",
                                      fmt(dt.payload),
                                      "",
                                      "Response:",
                                      fmt(dt.response),
                                    ].join("\n"),
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

export default LogCallbackPage;
