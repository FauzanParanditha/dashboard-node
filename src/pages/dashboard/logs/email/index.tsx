import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout/";
import Pagination from "@/components/pagination";
import useStore from "@/store";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";

const LogEmailPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();

  const { data: email, mutate: revalidate } = useSWR(
    "api/v1/adm/emaillogs?perPage=10&page=" + page + "&query=" + search
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
        <h4 className="my-4 text-2xl font-bold">List Email</h4>
        <div className="mt-8 rounded-2xl bg-white text-slate-700">
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
                  <table className="w-full leading-normal text-slate-500">
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
                          Message
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
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
                      {empty && (
                        <tr>
                          <td
                            className="border-b border-gray-200 py-6 text-center text-sm font-normal uppercase"
                            colSpan={4}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {email?.data?.map((dt: any, index: any) => {
                        let messages;

                        if (typeof dt.messages === "string") {
                          // Handle the string case
                          messages = {
                            code: dt.messages.code,
                            message: dt.messages || "null",
                          };
                        } else if (
                          dt.messages &&
                          typeof dt.messages === "object"
                        ) {
                          // Handle the object case
                          messages = {
                            code: dt.messages.code,
                            message: dt.messages.message || "null",
                          };
                        }
                        const data = JSON.stringify(messages, null, 2);
                        return (
                          <tr key={index} className="border-b">
                            <td className="border-gray-200 p-5 text-sm">
                              <div className="flex items-center">
                                {dt.email}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm">
                              <div className="flex items-center">{data}</div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm">
                              <div className="flex items-center">
                                {dt.statusCode}
                              </div>
                            </td>
                            <td className="border-gray-200 p-5 text-sm">
                              <p className="whitespace-nowrap">
                                {dayjs(dt._created).format("DD-MM-YYYY")}
                              </p>
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
                    paginate={email?.data?.pagination || {}}
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

export default LogEmailPage;
