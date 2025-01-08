import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import useStore from "@/store";
import { updatePasswordSchema } from "@/utils/schema/admin";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface Values {
  userId?: string;
  email: string;
  old_password: string;
  new_password: string;
  password_confirmation?: string;
}

const ChangePasswordUser = () => {
  const { setIsLoading } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(updatePasswordSchema),
  });

  const router = useRouter();
  const { id } = router.query;

  const getData = () => {
    setIsLoading(true);
    api()
      .get("api/v1/user/" + id)
      .then((res) => {
        if (res.data.success) {
          const dt = res.data.data;
          reset({
            email: dt.email,
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
    // setIsLoading(true);

    if (typeof id === "string") {
      data.userId = id;
    } else {
      console.error("userId is not a valid string.");
      setIsLoading(false);
      return;
    }

    api()
      .patch("/api/v1/auth/adm/change-password", data)
      .then((res) => {
        if (res.data.success) {
          toast.success("Change password success", { theme: "colored" });
          reset({
            email: data.email,
            old_password: "",
            new_password: "",
            password_confirmation: "",
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
        <title>Detail - User</title>
      </Head>
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
          <h2 className="text-xl font-semibold text-slate-500 dark:text-white">
            Change Password
          </h2>
          <div className="border-b-2 border-slate-400 dark:border-red-900"></div>

          <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="mb-4 pr-3">
                <InputField
                  type="email"
                  placeholder="your@email.id"
                  label="Email"
                  className="w-full"
                  {...register("email")}
                  disabled
                  error={errors.email?.message}
                />
              </div>

              <div className="mb-4 pr-3">
                <InputField
                  type="password"
                  label="Old Password"
                  className="w-full"
                  {...register("old_password")}
                  error={errors.old_password?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="mb-4 pr-3">
                <InputField
                  type="password"
                  label="New Password"
                  className="w-full"
                  {...register("new_password")}
                  error={errors.new_password?.message}
                />
              </div>

              <div className="mb-4 pr-3">
                <InputField
                  type="password"
                  label="Confirm Password"
                  className="w-full"
                  {...register("password_confirmation")}
                  error={errors.password_confirmation?.message}
                />
              </div>
            </div>
            <div className="my-2">
              <Button danger label="Change Password" block bold />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordUser;
