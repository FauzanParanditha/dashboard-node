import api, { handleAxiosError } from "@/api";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout/";
import Pagination from "@/components/pagination";
import useStore from "@/store";
import { checkAuthAdmin } from "@/utils/server";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Use the checkAuth function to handle authentication
  return checkAuthAdmin(context);
};

const LogCallbackPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();

  const { data: callback, mutate: revalidate } = useSWR(
    "api/v1/adm/callbacklogs?perPage=10&page=" + page + "&query=" + search,
  );
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

  //retry callback
  const RetryCallback = (data: any) => {
    const id = data._id;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "RETRY",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        api()
          .post("/api/v1/adm/retry/callback/" + id)
          .then((res) => {
            if (res.data.success) {
              //toast
              revalidate({}, true);
              toast.success(`${res.data.message}`, { theme: "colored" });
            } else {
              toast.error(`${res.data.message}`, { theme: "colored" });
            }
          })
          .catch((err) => {
            handleAxiosError(err);
          })
          .finally(() => setIsLoading(false));
      }
    });
  };

  return (
    <>
      <Head>
        <title>Callback List</title>
      </Head>
      <DashboardLayout>
        <h4 className="my-4 text-2xl font-bold dark:text-white">
          List Callback
        </h4>
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
                          Client
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Payload
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Callback Url
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Retry Count
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Created_at
                        </th>
                        <th
                          scope="col"
                          className="border-b border-gray-200 px-5 py-3 text-left text-sm font-normal uppercase"
                        >
                          Action
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
                              <div className="flex items-center">
                                {dt.client.name}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {JSON.stringify(dt.payload, null, 2)}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.callbackUrl}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center justify-center">
                                {dt.retryCount}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <div className="flex items-center">
                                {dt.errDesc}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <p className="whitespace-nowrap">
                                {dayjs(dt._created).format("DD-MM-YYYY")}
                              </p>
                            </td>
                            <td className="border-gray-200 p-5 text-sm dark:text-white">
                              <HiOutlineRefresh
                                className="h-5 w-5 text-rose-400"
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  RetryCallback(dt);
                                }}
                              />
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
    </>
  );
};

export default LogCallbackPage;
