import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import { useUserContext } from "@/context/user";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

type Values = {
  fullName: string;
  email: string;
};
const schema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Format is not valid")
    .required("Email is required"),
});
const Profile = () => {
  const { user } = useUserContext();
  const { setIsLoading } = useStore();

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  useEffect(() => {
    if (user !== undefined) {
      const userData = { ...user };
      reset(userData);
    }
  }, [user]);
  const onSubmit = (data: Values) => {
    const id = user._id;

    setIsLoading(true);
    api()
      .put("/api/v1/adm/admin/" + id, data)
      .then((res) => {
        if (res.data.success) {
          toast.success("Update profile success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-black dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
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
                  // value={getValues("fullName")}
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
                  value={getValues("email")}
                  required
                  disabled
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div className="my-2 grid grid-cols-2">
              <Button danger label="Update Data" block bold />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Profile;
