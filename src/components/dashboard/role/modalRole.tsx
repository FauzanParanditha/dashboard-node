import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import TextArea from "@/components/form/text-area";
import useStore from "@/store";
import type { Role } from "@/types/rbac";
import { createRoleSchema } from "@/utils/schema/role";
import { buildPermissionGroups, RBAC_PERMISSION_GROUPS } from "@/utils/rbac";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";
import useSWR from "swr";

type Values = {
  name: string;
  description: string;
  permissions: string[];
};

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  revalidate: (...args: any[]) => void;
  selectedRole?: Role | null;
};

const ModalRole = ({
  isOpen = false,
  setIsOpen,
  revalidate,
  selectedRole = null,
}: Props) => {
  const { setIsLoading } = useStore();
  const isEditMode = Boolean(selectedRole?._id);
  const { data: permissionsResponse } = useSWR("api/v1/adm/permissions");
  const { data: roleDetailResponse } = useSWR(
    isOpen && selectedRole?._id
      ? `api/v1/adm/role/${selectedRole._id}`
      : null,
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const selectedPermissions = watch("permissions") || [];
  const availablePermissions = Array.isArray(permissionsResponse?.data)
    ? permissionsResponse.data.map((item: unknown) => String(item))
    : [];
  const permissionGroups =
    availablePermissions.length > 0
      ? buildPermissionGroups(availablePermissions)
      : RBAC_PERMISSION_GROUPS;

  useEffect(() => {
    const roleDetail = roleDetailResponse?.data;

    if (isOpen && selectedRole && roleDetail) {
      reset({
        name: roleDetail.name || selectedRole.name,
        description: roleDetail.description || selectedRole.description || "",
        permissions: (roleDetail.permissions || selectedRole.permissions || []).map((permission: unknown) =>
          String(permission),
        ),
      });
      return;
    }

    if (isOpen && selectedRole) {
      reset({
        name: selectedRole.name,
        description: selectedRole.description || "",
        permissions: selectedRole.permissions?.map((permission) =>
          String(permission),
        ),
      });
      return;
    }

    if (isOpen) {
      reset({
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [isOpen, reset, roleDetailResponse?.data, selectedRole]);

  const togglePermission = (permission: string) => {
    const nextPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((item) => item !== permission)
      : [...selectedPermissions, permission];

    setValue("permissions", nextPermissions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (data: Values) => {
    setIsLoading(true);

    const request = isEditMode
      ? api().put(`api/v1/adm/role/${selectedRole?._id}`, data)
      : api().post("api/v1/adm/role", data);

    request
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          reset();
          toast.success(
            `${isEditMode ? "Update" : "Create"} Role success`,
            { theme: "colored" },
          );
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Transition as={Dialog} show={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 z-50 flex w-screen items-center justify-center p-4">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="my-8 inline-block max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-800">
            <DialogTitle
              as="h3"
              className="flex justify-between py-2 text-lg font-medium leading-6 text-gray-900 dark:text-white"
            >
              {isEditMode ? "Update Role" : "Create Role"}
              <button
                type="button"
                className="rounded-full bg-rose-50 p-1 text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  reset();
                }}
              >
                <HiOutlineX className="h-5 w-5 text-rose-600" />
              </button>
            </DialogTitle>
            <div className="my-1 border border-red-800"></div>

            <form method="post" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <InputField
                    className="w-full"
                    placeholder="ex: support"
                    label="Role Name"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>
                <div>
                  <TextArea
                    className="min-h-[42px] w-full"
                    placeholder="Role description"
                    label="Description"
                    {...register("description")}
                    error={errors.description?.message}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-200">
                  Permissions
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.key}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-100">
                        {group.label}
                      </div>
                      <div className="space-y-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission.key}
                            className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(
                                permission.key,
                              )}
                              onChange={() => togglePermission(permission.key)}
                              className="mt-1"
                            />
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.permissions?.message && (
                  <span className="mt-2 inline-block text-xs text-red-800">
                    {errors.permissions.message}
                  </span>
                )}
              </div>

              <div className="mt-6 w-full sm:w-40">
                <Button
                  success
                  label={isEditMode ? "Update Role" : "Create Role"}
                  block
                  bold
                />
              </div>
            </form>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};

export default ModalRole;
