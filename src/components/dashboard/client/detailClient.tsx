import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import MultiSelectField from "@/components/form/multi-select";
import useStore from "@/store";
import { getValidObjectId } from "@/utils/helper";
import { updateClientSchema } from "@/utils/schema/client";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Values = {
  name: string;
  notifyUrl?: string;
  userId: string;
  active: boolean;
  availablePaymentIds?: string[];
};

const options = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const DetailClnt = () => {
  const { setIsLoading } = useStore();
  const router = useRouter();
  const { id } = router.query;
  const [userOptions, setUserOptions] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(updateClientSchema),
  });

  const getData = () => {
    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid client ID"));
      return;
    }

    api()
      .get(`api/v1/client/${validId}`)
      .then((res) => {
        if (res.data.success) {
          const dt = res.data.data;
          const selectedFromAvailablePayments = Array.isArray(
            dt.availablePayments,
          )
            ? dt.availablePayments
                .map((p: any) => p?.availablePayment?._id || p?.id)
                .filter(Boolean)
            : [];

          reset({
            name: dt.name,
            notifyUrl: dt.notifyUrl,
            userId: dt.userId._id,
            active: dt.active,
            availablePaymentIds: selectedFromAvailablePayments.length
              ? selectedFromAvailablePayments
              : (dt.availablePaymentIds || []).map((p: any) =>
                  typeof p === "string" ? p : p._id,
                ),
          });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };


  const fetchAvailablePayments = () => {
    setIsLoading(true);
    api()
      .get("api/v1/available-payment?limit=1000&page=1")
      .then((res) => {
        if (res.data.success) {
          const opts = res.data.data.map((p: any) => ({
            label: p.name,
            value: p._id,
          }));
          setPaymentOptions(opts);
        }
      })
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  };

  const fetchUsers = () => {
    setIsLoading(true);
    api()
      .get("api/v1/users")
      .then((res) => {
        if (res.data.success) {
          const users = res.data.data.map((user: any) => ({
            label: user.fullName,
            value: user._id,
          }));
          setUserOptions(users);
        }
      })
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (id != undefined) {
      getData();
    }
    fetchUsers();
    fetchAvailablePayments();
  }, [id]);

  const onSubmit = (data: Values) => {
    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid admin ID"));
      return;
    }

    api()
      .put(`api/v1/client/${validId}`, data)
      .then((res) => {
        if (res.data.success) {
          getData();
          toast.success("Update Client success", { theme: "colored" });
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
        <title>Detail - Client</title>
      </Head>
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
          <h2 className="text-xl font-semibold text-slate-500 dark:text-white">
            Client Profile
          </h2>
          <div className="border-b-2 border-slate-400 dark:border-red-900"></div>

          <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-1">
              <div className="mb-4 pr-3">
                <InputField
                  placeholder="example"
                  label="Full Name"
                  className="w-full"
                  {...register("name")}
                  required
                  error={errors.name?.message}
                />
              </div>
              <div className="mb-4 pr-3">
                <Controller
                  control={control}
                  name="userId"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      name="userId"
                      label="Assign User"
                      required
                      options={userOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.userId?.message}
                    />
                  )}
                />
              </div>
              <div className="mb-4 pr-3">
                <Controller
                  control={control}
                  name="availablePaymentIds"
                  render={({ field: { onChange, value } }) => (
                    <MultiSelectField
                      name="availablePaymentIds"
                      label="Available Payments"
                      options={paymentOptions}
                      value={value || []}
                      onChange={onChange}
                      error={errors.availablePaymentIds?.message as any}
                    />
                  )}
                />
              </div>
              <div className="mb-4 pr-3">
                <InputField
                  label="Notify Url"
                  placeholder="your@email.id"
                  className="w-full"
                  {...register("notifyUrl")}
                  error={errors.notifyUrl?.message}
                />
              </div>
              <div className="mb-4 pr-2">
                <Controller
                  control={control}
                  name="active"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      name="active"
                      label="Status"
                      required
                      options={options}
                      value={value}
                      onChange={onChange}
                      error={errors.active?.message}
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
export default DetailClnt;
