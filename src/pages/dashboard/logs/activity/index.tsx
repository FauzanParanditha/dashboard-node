import LogDetailModal from "@/components/dashboard/logs/LogDetailModal";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout/";
import { useRBAC } from "@/hooks/use-rbac";
import Pagination from "@/components/pagination";
import { useAuthGuard } from "@/hooks/use-auth";
import useStore from "@/store";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const LogActivityPage = () => {
  useAuthGuard(["logs:activity"]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { setIsLoading } = useStore();
  const { hasAnyPermission, roleName } = useRBAC();
  const [detail, setDetail] = useState<{
    title: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    setRoleFilter(roleName || "");
  }, [roleName]);

  const activityEndpoint = useMemo(() => {
    if (roleFilter === null) return null;

    const params = new URLSearchParams({
      limit: "10",
      page: String(page),
      query: search,
    });

    const canReadAllLogs = hasAnyPermission([
      "admin:list",
      "admin:read",
      "role:list",
    ]);
    if (roleFilter && !canReadAllLogs) {
      params.set("role", roleFilter);
    }

    return `api/v1/adm/activitylogs/?${params.toString()}`;
  }, [hasAnyPermission, page, roleFilter, search]);

  const { data: activity, mutate: revalidate } = useSWR(
    activityEndpoint,
  );
  useEffect(() => {
    setIsLoading(true);
    if (activity !== undefined) {
      if (activity?.data?.length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
        setIsLoading(true);
      }
      setIsLoading(false);
    }
  }, [activity]);

  return (
    <>
      <Head>
        <title>Activity List</title>
      </Head>
      <DashboardLayout>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-5 text-slate-700 shadow dark:bg-black dark:text-white sm:p-6">
          <div className="px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Activity
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
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
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Action
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          IP Address
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Created At
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
                            colSpan={6}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {activity?.data?.map((dt: any, index: any) => {
                        return (
                          <tr key={index} className="border-b">
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.action}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                  {dt.role}
                                </span>
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.email || "-"}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.ipAddress}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <p className="whitespace-nowrap">
                                {dayjs(dt.createdAt).format(
                                  "DD-MM-YYYY HH:mm:ss",
                                )}
                              </p>
                            </td>
                            <td className="border-gray-200 p-5 text-center text-sm dark:text-white">
                              <button
                                className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                                onClick={() =>
                                  setDetail({
                                    title: "Activity Detail",
                                    content: JSON.stringify(dt, null, 2),
                                  })
                                }
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
                    paginate={activity?.pagination || {}}
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

export default LogActivityPage;
