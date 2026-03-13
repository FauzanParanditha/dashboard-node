import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import useStore from "@/store";
import { Role } from "@/types/rbac";
import { getValidObjectId } from "@/utils/helper";
import { updateUserSchema } from "@/utils/schema/admin";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useSWR from "swr";

type Values = {
  fullName: string;
  email: string;
  roleId: string;
  verified: boolean;
};

const options = [
  { label: "Verified", value: true },
  { label: "Un Verified", value: false },
];

const DetailUsr = () => {
  const { setIsLoading } = useStore();
  const router = useRouter();
  const { id } = router.query;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(updateUserSchema),
  });
  const { data: rolesResponse } = useSWR("api/v1/adm/roles?limit=100&page=1");
  const roleOptions = (rolesResponse?.data || []).map((role: Role) => ({
    label: role.name,
    value: role._id,
  }));

  const getData = () => {
    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid user ID"));
      return;
    }

    api()
      .get(`api/v1/user/${validId}`)
      .then((res) => {
        if (res.data.success) {
          const dt = res.data.data;
          reset({
            fullName: dt.fullName,
            email: dt.email,
            roleId:
              dt.roleId?._id || dt.role?._id || dt.roleId || dt.role || "",
            verified: dt.verified,
          });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (id != undefined) {
      getData();
    }
  }, [id]);

  const onSubmit = (data: Values) => {
    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid user ID"));
      return;
    }

    api()
      .put(`api/v1/user/${validId}`, data)
      .then((res) => {
        if (res.data.success) {
          getData();
          toast.success("Update User success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <>
      <Head>
        <title>Detail - User</title>
      </Head>
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
          <h2 className="text-xl font-semibold text-slate-500 dark:text-white">
            User Profile
          </h2>
          <div className="border-b-2 border-slate-400 dark:border-red-900"></div>

          <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-1">
              <div className="mb-4 pr-3">
                <InputField
                  placeholder="example"
                  label="Full Name"
                  className="w-full"
                  {...register("fullName")}
                  required
                  error={errors.fullName?.message}
                />
              </div>
              <div className="mb-4 pr-3">
                <InputField
                  type="email"
                  label="Email"
                  placeholder="your@email.id"
                  className="w-full"
                  {...register("email")}
                  required
                  disabled
                  error={errors.email?.message}
                />
              </div>
              <div className="mb-4 pr-2">
                <Controller
                  control={control}
                  name="roleId"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      name="roleId"
                      label="Role"
                      required
                      options={roleOptions}
                      value={value}
                      onChange={onChange}
                      placeholder="Select role"
                      error={errors.roleId?.message}
                    />
                  )}
                />
              </div>
              <div className="mb-4 pr-2">
                <Controller
                  control={control}
                  name="verified"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      name="verified"
                      label="Verified"
                      required
                      options={options}
                      value={value}
                      onChange={onChange}
                      disabled
                      error={errors.verified?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="my-2">
              <Button success label="Update Data" block bold />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default DetailUsr;
