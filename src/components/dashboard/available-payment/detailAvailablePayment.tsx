import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import useStore from "@/store";
import { getValidObjectId } from "@/utils/helper";
import { updateAvailablePaymentSchema } from "@/utils/schema/available-payment";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Values = {
  name: string;
  image?: File | null;
  category: string;
  adminId: string;
  active: boolean;
};

const options = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const DetailAvaPay = () => {
  const { setIsLoading } = useStore();
  const router = useRouter();
  const { id } = router.query;
  const [userOptions, setUserOptions] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(updateAvailablePaymentSchema),
  });

  const getData = () => {
    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid available payment ID"));
      return;
    }

    api()
      .get(`api/v1/available-payment/${validId}`)
      .then((res) => {
        if (res.data.success) {
          const dt = res.data.data;
          reset({
            name: dt.name,
            active: dt.active,
            adminId: dt.adminId._id,
            category: dt.category,
          });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  const fetchUsers = () => {
    setIsLoading(true);
    api()
      .get("api/v1/adm/admins")
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
  }, [id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setValue("image", file); // Set the selected file in the form state
  };

  const onSubmit = (data: Values) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("adminId", data.adminId);
    formData.append("active", JSON.stringify(data.active));
    if (data.image) {
      formData.append("image", data.image); // Append the file
    }

    setIsLoading(true);

    const validId = getValidObjectId(typeof id === "string" ? id : "");
    if (!validId) {
      handleAxiosError(new Error("Invalid available payment ID"));
      return;
    }

    api()
      .put(`api/v1/available-payment/${validId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.success) {
          // getData();
          router.push("/dashboard/available-payment");
          toast.success("Update Available Payment success", {
            theme: "colored",
          });
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
        <title>Detail - Available Payment</title>
      </Head>
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
          <h2 className="text-xl font-semibold text-slate-500 dark:text-white">
            Available Payment Profile
          </h2>
          <div className="border-b-2 border-slate-400 dark:border-red-900"></div>

          <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-1">
              <div className="mb-4 pr-3">
                <InputField
                  placeholder="example"
                  label="Name"
                  className="w-full"
                  {...register("name")}
                  required
                  error={errors.name?.message}
                />
              </div>
              <div className="mb-4 hidden pr-3">
                <Controller
                  control={control}
                  name="adminId"
                  render={({ field: { onChange, value } }) => (
                    <SelectField
                      name="adminId"
                      label="Admin"
                      required
                      options={userOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.adminId?.message}
                    />
                  )}
                />
              </div>
              <div className="mb-4 pr-3">
                <InputField
                  label="Category"
                  placeholder="sample"
                  className="w-full"
                  {...register("category")}
                  required
                  error={errors.category?.message}
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
              <div className="mb-4 pr-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Upload Picture
                </label>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-black dark:file:text-white dark:hover:file:bg-slate-500"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image.message}</p>
                )}
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
export default DetailAvaPay;
