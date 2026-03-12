import api, { handleAxiosError } from "@/api";
import ModalRole from "@/components/dashboard/role/modalRole";
import SearchForm from "@/components/form/search";
import { DashboardLayout } from "@/components/layout";
import Pagination from "@/components/pagination";
import { useAdminAuthGuard } from "@/hooks/use-admin";
import { useRBAC } from "@/hooks/use-rbac";
import useStore from "@/store";
import type { Role } from "@/types/rbac";
import Head from "next/head";
import { useEffect, useState } from "react";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useSWR from "swr";

const RolePage = () => {
  useAdminAuthGuard(["role:list"]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { setIsLoading } = useStore();
  const { hasPermission } = useRBAC();
  const canCreateRole = hasPermission("role:create");
  const canUpdateRole = hasPermission("role:update");
  const canDeleteRole = hasPermission("role:delete");

  const { data: rolesResponse, mutate: revalidate } = useSWR(
    `api/v1/adm/roles?limit=${10}&page=${page}&query=${search}`,
  );

  useEffect(() => {
    if (rolesResponse !== undefined) {
      setEmpty((rolesResponse?.data || []).length === 0);
    }
  }, [rolesResponse]);

  const deleteRole = (role: Role) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991B1B",
      cancelButtonColor: "#1E293B",
      confirmButtonText: "DELETE",
    }).then((result) => {
      if (!result.isConfirmed) return;

      setIsLoading(true);
      api()
        .delete(`api/v1/adm/role/${role._id}`)
        .then((res) => {
          if (res.data.success) {
            revalidate({}, true);
            toast.success("Delete Role Success", { theme: "colored" });
          }
        })
        .catch((err) => handleAxiosError(err))
        .finally(() => setIsLoading(false));
    });
  };

  const roles = rolesResponse?.data || [];

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - Role</title>
      </Head>
      <div className="animate-fade-down conatiner mx-auto my-6 rounded bg-white p-5 shadow dark:bg-black sm:p-6">
        <div className="px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                List Role
              </h1>
            </div>
            {canCreateRole && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setIsOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-cyan-500"
              >
                Add Role
                <HiOutlinePlus className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-6 max-w-md">
            <SearchForm
              search={search}
              setSearch={setSearch}
              revalidate={revalidate}
              placeholder="role name"
            />
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white">
                        Role
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Description
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Permissions
                      </th>
                      <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
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
                    {roles.map((role: Role) => (
                      <tr key={role._id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 dark:text-white">
                          <div>{role.name}</div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-white">
                          <div className="max-w-[280px] truncate">
                            {role.description || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 dark:text-white">
                          <span className="inline-flex rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {(role.permissions || []).length} permissions
                          </span>
                        </td>
                        <td className="flex items-center justify-center gap-4 py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                          {canUpdateRole && (
                            <HiOutlinePencil
                              className="h-5 w-5 cursor-pointer text-blue-400"
                              onClick={() => {
                                setSelectedRole(role);
                                setIsOpen(true);
                              }}
                            />
                          )}
                          {canDeleteRole && (
                            <HiOutlineTrash
                              className="h-5 w-5 cursor-pointer text-rose-400"
                              onClick={() => deleteRole(role)}
                            />
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
                paginate={rolesResponse?.pagination || {}}
                onPageChange={(pg) => setPage(pg)}
                limit={1}
              />
            </div>
          )}
        </div>

        {(canCreateRole || canUpdateRole) && (
          <ModalRole
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedRole={selectedRole}
            revalidate={revalidate}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default RolePage;
