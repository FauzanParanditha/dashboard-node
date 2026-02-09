import api, { handleAxiosError } from "@/api";
import ModalIp from "@/components/dashboard/ip/modalIp";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import { useUserContext } from "@/context/user";
import { useAdminAuthGuard } from "@/hooks/use-admin";
import useStore from "@/store";
import Head from "next/head";
import { useEffect, useState } from "react";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";
import dayjs from "dayjs";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const WhitelistPage = () => {
  useAdminAuthGuard();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const { user } = useUserContext();

  const [defaultValue, setDefaultValue] = useState({});
  const [id, setId] = useState(0); //id for update
  const [isUpdate, setIsUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: ips, mutate: revalidate } = useSWR(
    `/api/v1/whitelist?limit=${10}&page=${page}&query=${search}`,
  );

  useEffect(() => {
    if (ips !== undefined) {
      if (ips?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [ips]);

  //delete ips
  const DeleteIp = (data: any) => {
    const id = data._id;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "DELETE",
    }).then((result) => {
      if (result.isConfirmed) {
        //delete data
        setIsLoading(true);
        api()
          .delete("/api/v1/whitelist/" + id)
          .then((res) => {
            if (res.data.success) {
              //toast
              revalidate({}, true);
              toast.success("Delete Ip Success", { theme: "colored" });
            }
          })
          .catch((err) => {
            handleAxiosError(err);
          })
          .finally(() => setIsLoading(false));
      }
    });
  };

  const CreateIp = () => {
    setDefaultValue({ ipAddress: "" });
    setIsOpen(true);
    setIsUpdate(false);
  };

  const UpdateIp = (dt: any) => {
    setDefaultValue({ ipAddress: dt.ipAddress });
    setIsUpdate(true);
    setId(dt._id);
    setIsOpen(true);
  };

  return (
    <>
      <DashboardLayout>
        <Head>
          <title>Dashboard - IP</title>
        </Head>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-4 shadow dark:bg-black">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Ip Whitelist
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => CreateIp()}
                  className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                >
                  Add Ip
                  <HiOutlinePlus className="h-5 w-5" />
                </button>
              </div>
            </div>
            <SearchForm
              search={search}
              setSearch={setSearch}
              revalidate={revalidate}
              placeholder="Ip address"
            />
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Ip
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Created By
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
                            colSpan={3}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {ips?.data?.map((ip: any, idx: any) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            {ip.ipAddress}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                            <div className="font-medium text-slate-700 dark:text-white">
                              {ip.adminId?.fullName || ip.adminId?.email}
                            </div>
                            {ip.adminId?.fullName && (
                              <div className="text-xs text-slate-400">
                                {ip.adminId?.email}
                              </div>
                            )}
                            {ip.createdAt && (
                              <div className="text-xs text-slate-400">
                                Created: {dayjs(ip.createdAt).format("DD-MM-YYYY")}
                              </div>
                            )}
                          </td>
                          <td className="flex items-center justify-center gap-4 py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                            {user._id === ip.adminId?._id ? (
                              <>
                                <HiOutlinePencil
                                  className="h-5 w-5 text-blue-400"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    UpdateIp(ip);
                                  }}
                                />
                                <HiOutlineTrash
                                  className="h-5 w-5 text-rose-400"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    DeleteIp(ip);
                                  }}
                                />
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
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
                  paginate={ips?.pagination || {}}
                  onPageChange={(pg) => setPage(pg)}
                  limit={1}
                />
              </div>
            )}
          </div>
          <ModalIp
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            defaultValue={defaultValue}
            revalidate={revalidate}
            isUpdate={isUpdate}
            id={id}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default WhitelistPage;
