import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout/";
import Pagination from "@/components/pagination";
import { useAdminAuthGuard } from "@/hooks/use-admin";
import useStore from "@/store";
import LogDetailModal from "@/components/dashboard/logs/LogDetailModal";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const LogEmailPage = () => {
  useAdminAuthGuard();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [detail, setDetail] = useState<{ title: string; content: string } | null>(
    null,
  );

  const { data: email, mutate: revalidate } = useSWR(
    "api/v1/adm/emaillogs?perPage=10&page=" + page + "&query=" + search,
  );
  useEffect(() => {
    setIsLoading(true);
    if (email !== undefined) {
      if (email?.data?.length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
        setIsLoading(true);
      }
      setIsLoading(false);
    }
  }, [email]);

  return (
    <>
      <Head>
        <title>Email List</title>
      </Head>
      <DashboardLayout>
        <h4 className="my-4 text-2xl font-bold dark:text-white">List Email</h4>
        <div className="mt-8 rounded-2xl bg-white text-slate-700 dark:bg-black dark:text-white">
          <div className="flex items-center justify-between px-8 pt-4">
            <SearchForm
              search={search}
              setSearch={setSearch}
              revalidate={revalidate}
              placeholder="Name"
            />
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
                          Email
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Message (Preview)
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
                            colSpan={5}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {email?.data?.map((dt: any, index: any) => {
                        return (
                          <tr key={index} className="border-b">
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.email}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="max-w-[320px] truncate">
                                {typeof dt.messages === "string"
                                  ? dt.messages
                                  : JSON.stringify(dt.messages)}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.statusCode}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <p className="whitespace-nowrap">
                                {dayjs(dt._created).format("DD-MM-YYYY")}
                              </p>
                            </td>
                            <td className="border-gray-200 p-5 text-center text-sm dark:text-white">
                              <button
                                className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                                onClick={() =>
                                  setDetail({
                                    title: "Email Detail",
                                    content:
                                      typeof dt.messages === "string"
                                        ? dt.messages
                                        : JSON.stringify(dt.messages, null, 2),
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
                    paginate={email?.pagination || {}}
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

export default LogEmailPage;
