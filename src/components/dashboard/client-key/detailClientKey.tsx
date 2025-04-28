import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import TextArea from "@/components/form/text-area";
import useStore from "@/store";
import { updateClientKeySchema } from "@/utils/schema/client-key";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Values = {
  clientId: string;
  publicKey: string;
  active: boolean;
};

const options = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const DetailClntKey = () => {
  const { setIsLoading } = useStore();
  const router = useRouter();
  const { id } = router.query;
  const [userOptions, setUserOptions] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(updateClientKeySchema),
  });

  const getData = () => {
    setIsLoading(true);
    api()
      .get("api/v1/client-key/" + id)
      .then((res) => {
        if (res.data.success) {
          const dt = res.data.data;
          reset({
            clientId: dt.clientId,
            publicKey: dt.publicKey,
            active: dt.active,
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
    api()
      .put("api/v1/client-key/" + id, data)
      .then((res) => {
        if (res.data.success) {
          getData();
          toast.success("Update Client Key success", { theme: "colored" });
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
                  label="Client Key"
                  className="w-full"
                  {...register("clientId")}
                  required
                  error={errors.clientId?.message}
                />
              </div>
              <div className="mb-4 pr-3">
                <TextArea
                  className="w-full"
                  placeholder="PUB-XXXX"
                  label="Public Key"
                  {...register("publicKey")}
                  error={errors.publicKey?.message}
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
export default DetailClntKey;
