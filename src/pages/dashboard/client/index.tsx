import api, { handleAxiosError } from "@/api";
import ModalClient from "@/components/dashboard/client/modaClient";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import useStore from "@/store";
import clsx from "clsx";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

const ClientPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const { data: clients, mutate: revalidate } = useSWR(
    `api/v1/client?limit=${10}&page=${page}&query=${search}`
  );

  useEffect(() => {
    if (clients !== undefined) {
      if (clients?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [clients]);

  //delete client
  const DeleteClient = (data: any) => {
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
          .delete("api/v1/client/" + id)
          .then((res) => {
            if (res.data.success) {
              //toast
              revalidate({}, true);
              toast.success("Delete Client Success", { theme: "colored" });
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
      <DashboardLayout>
        <Head>
          <title>Dashboard - Client</title>
        </Head>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-4 shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                  List Client
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                >
                  Add Client
                  <HiOutlinePlus className="h-5 w-5" />
                </button>
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
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Client ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Notify URL
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
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
                            colSpan={6}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {clients?.data?.map((client: any, idx: any) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {client.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.clientId}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.notifyUrl}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.userId.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={clsx(
                                client.active === true
                                  ? "bg-teal-400"
                                  : "bg-rose-400",
                                "inline-flex rounded px-4 py-1 text-xs text-white"
                              )}
                            >
                              {client.active ? "Active" : "NOT Active"}
                            </span>
                          </td>
                          <td className="flex items-center justify-center gap-4 py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                            <Link href={`/dashboard/client/${client._id}`}>
                              <HiOutlinePencil className="h-5 w-5 text-blue-400" />
                            </Link>
                            <HiOutlineTrash
                              className="h-5 w-5 text-rose-400"
                              onClick={(e: any) => {
                                e.stopPropagation();
                                DeleteClient(client);
                              }}
                            />
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
                  paginate={clients?.pagination || {}}
                  onPageChange={(pg) => setPage(pg)}
                  limit={1}
                />
              </div>
            )}
          </div>
          <ModalClient
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            revalidate={revalidate}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default ClientPage;
