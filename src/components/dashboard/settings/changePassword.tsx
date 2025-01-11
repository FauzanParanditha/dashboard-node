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
import YupPassword from "yup-password";
YupPassword(yup);

interface Values {
  email: string;
  old_password: string;
  new_password: string;
  password_confirmation?: string;
}

const schema = yup.object({
  email: yup.string().required("email is required"),
  old_password: yup.string().required("Old password is required!"),
  new_password: yup
    .string()
    .min(8, "min 8 character")
    .minLowercase(1, "password must contain at least 1 lower case letter")
    .minUppercase(1, "password must contain at least 1 upper case letter")
    .minNumbers(1, "password must contain at least 1 number")
    .minSymbols(1, "password must contain at least 1 special character")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password")], "password not same"),
});

const ChangePassword = () => {
  const { user } = useUserContext();
  const { setIsLoading } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user !== undefined) {
      setValue("email", user.email);
    }
  }, [user]);

  const onSubmit = (data: Values) => {
    setIsLoading(true);
    api()
      .patch("/adm/auth/change-password", data)
      .then((res) => {
        if (res.data.success) {
          toast.success("Change password success", { theme: "colored" });
          reset({
            email: user.email,
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
      <div className="grid grid-cols-12">
        <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-black dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
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
            <div className="my-2 grid grid-cols-2">
              <Button danger label="Change Password" block bold />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default ChangePassword;
