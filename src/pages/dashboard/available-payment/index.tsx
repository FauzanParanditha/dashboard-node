import api, { handleAxiosError } from "@/api";
import ModalAvailablePayment from "@/components/dashboard/available-payment/modaAvailablePayment";
import ModalImage from "@/components/dashboard/available-payment/modalImage";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import { useUserContext } from "@/context/user";
import { useAuthGuard } from "@/hooks/use-auth";
import useStore from "@/store";
import { formatRupiah, getTransactionLimit } from "@/utils/transaction-limit";
import { jwtConfig } from "@/utils/var";
import clsx from "clsx";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const AvailablePaymentPage = () => {
  useAuthGuard();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { setIsLoading } = useStore();
  const [modalImageData, setModalImageData] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();
  const [role, setRole] = useState("");
  const [clientId, setClientId] = useState("");

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

  useEffect(() => {
    if (isAdmin) return;
    const firstClientId = user?.clients?.[0]?.clientId || "";
    setClientId(firstClientId);
  }, [isAdmin, user]);

  const { data: availablePayment, mutate: revalidate } = useSWR(
    isAdmin
      ? `api/v1/available-payment?limit=${10}&page=${page}&query=${search}`
      : clientId
        ? `api/v1/client-available-payments?limit=${10}&page=${page}&query=${search}&clientId=${clientId}`
        : null,
  );

  useEffect(() => {
    if (availablePayment !== undefined) {
      if (availablePayment?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [availablePayment]);

  //show image
  const ShowImage = async (image: any) => {
    const imageUrl = `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/${image}`; // Construct the full URL
    setModalImageData(imageUrl);
    setModalOpen(true);
  };

  //delete client
  const DeleteAvailablePayment = (data: any) => {
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
          .delete("api/v1/available-payment/" + id)
          .then((res) => {
            if (res.data.success) {
              //toast
              revalidate({}, true);
              toast.success("Delete Available Payment Success", {
                theme: "colored",
              });
            }
          })
          .catch((err) => {
            handleAxiosError(err);
          })
          .finally(() => setIsLoading(false));
      }
    });
  };

  const ToggleAvailablePayment = (availablePaymentId: string, active: boolean) => {
    if (!clientId || !availablePaymentId) return;

    const nextActive = !active;
    const actionLabel = nextActive ? "ACTIVE" : "INACTIVE";

    Swal.fire({
      title: "Are you sure?",
      text: `Set payment to ${actionLabel}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0E7490",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "CONFIRM",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        api()
          .patch("api/v1/client-available-payments", {
            clientId,
            availablePaymentId,
            active: nextActive,
          })
          .then((res) => {
            if (res.data.success) {
              revalidate({}, true);
              toast.success(
                `Set Available Payment ${nextActive ? "Active" : "Inactive"} Success`,
                {
                  theme: "colored",
                },
              );
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
          <title>Dashboard - Available Payment</title>
        </Head>
        <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-4 shadow dark:bg-black">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                  List Available Payment
                </h1>
                <p className="mt-2 text-sm text-gray-700"></p>
              </div>
              {isAdmin && (
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                  >
                    Add Available Payment
                    <HiOutlinePlus className="h-5 w-5" />
                  </button>
                </div>
              )}
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
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                        >
                          Name
                        </th>
                        {isAdmin && (
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            Admin
                          </th>
                        )}
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Limit
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
                            colSpan={6}
                          >
                            Data Not Found
                          </td>
                        </tr>
                      )}
                      {availablePayment?.data?.map(
                        (available: any, idx: any) => {
                          const ap = available?.availablePayment || available;
                          const displayName = ap?.name || available?.name;
                          const displayCategory =
                            ap?.category || available?.category;
                          const displayImage = ap?.image || available?.image;
                          const isActive =
                            available?.active ?? ap?.active ?? false;
                          const displayLimit = getTransactionLimit(displayName);
                          const clientAvailablePaymentId =
                            available?.availablePayment?._id || ap?._id || "";

                          return (
                            <tr key={idx}>
                              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                                <div>{displayName}</div>
                                <div className="text-xs text-slate-400">
                                  {displayCategory}
                                </div>
                              </td>
                              {isAdmin && (
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                  <div className="font-medium text-slate-700 dark:text-white">
                                    {available.adminId?.fullName ||
                                      available.adminId?.email ||
                                      "-"}
                                  </div>
                                  {available.adminId?.fullName && (
                                    <div className="text-xs text-slate-400">
                                      {available.adminId?.email}
                                    </div>
                                  )}
                                </td>
                              )}
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                <span
                                  className={clsx(
                                    isActive ? "bg-teal-400" : "bg-rose-400",
                                    "inline-flex rounded px-4 py-1 text-xs text-white",
                                  )}
                                >
                                  {isActive ? "Active" : "NOT Active"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-white">
                                <div className="text-xs">
                                  <span className="font-semibold">Min:</span>{" "}
                                  {formatRupiah(displayLimit.min)}
                                </div>
                                <div className="text-xs">
                                  <span className="font-semibold">Max:</span>{" "}
                                  {formatRupiah(displayLimit.max)}
                                </div>
                              </td>
                              <td className="flex items-center justify-center gap-4 py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                                {isAdmin ? (
                                  <>
                                    <HiOutlineEye
                                      className="h-5 w-5 text-emerald-500"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        ShowImage(displayImage);
                                      }}
                                    />
                                    <Link
                                      href={`/dashboard/available-payment/${available._id}`}
                                    >
                                      <HiOutlinePencil className="h-5 w-5 text-blue-400" />
                                    </Link>
                                    <HiOutlineTrash
                                      className="h-5 w-5 text-rose-400"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        DeleteAvailablePayment(available);
                                      }}
                                    />
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isActive}
                                    className={clsx(
                                      isActive
                                        ? "bg-teal-500 hover:bg-teal-400"
                                        : "bg-slate-400 hover:bg-slate-300",
                                      "relative inline-flex h-7 w-14 items-center rounded-full px-1 transition-colors duration-200",
                                      !clientAvailablePaymentId &&
                                        "cursor-not-allowed opacity-50",
                                    )}
                                    onClick={() =>
                                      ToggleAvailablePayment(
                                        clientAvailablePaymentId,
                                        isActive,
                                      )
                                    }
                                    disabled={!clientAvailablePaymentId}
                                  >
                                    <span
                                      className={clsx(
                                        isActive
                                          ? "translate-x-7"
                                          : "translate-x-0",
                                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200",
                                      )}
                                    />
                                    <span className="sr-only">
                                      {isActive ? "Set Inactive" : "Set Active"}
                                    </span>
                                    <span className="absolute -right-10 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                      {isActive ? "ON" : "OFF"}
                                    </span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {!empty && (
              <div className="flex items-center justify-center border-t py-4">
                <Pagination
                  paginate={availablePayment?.pagination || {}}
                  onPageChange={(pg) => setPage(pg)}
                  limit={1}
                />
              </div>
            )}
          </div>
          <ModalAvailablePayment
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            revalidate={revalidate}
          />
          <ModalImage
            isOpen={modalOpen}
            setIsOpen={setModalOpen}
            data={modalImageData} // Pass the image data to the modal
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default AvailablePaymentPage;
