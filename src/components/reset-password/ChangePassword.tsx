import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

type ResetData = {
  code: string;
  email: string;
  password: string;
  password_confirmation?: string;
};
const schema = yup.object({
  code: yup.string().required("code is required"),
  email: yup.string().email("email is not valid").required("email is required"),
  password: yup
    .string()
    .min(8, "min 8 character")
    .minLowercase(1, "password must contain at least 1 lower case letter")
    .minUppercase(1, "password must contain at least 1 upper case letter")
    .minNumbers(1, "password must contain at least 1 number")
    .minSymbols(1, "password must contain at least 1 special character")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "password not same"),
});

const ChangePassword = () => {
  const { setIsLoading } = useStore();
  const router = useRouter();
  const { email } = router.query;
  const { code } = router.query;

  useEffect(() => {
    if (email != undefined) {
      setValue("email", String(email));
    }
    if (code != undefined) {
      setValue("code", String(code));
    }
  }, [email, code]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetData>({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const onSubmit = (data: ResetData) => {
    setIsLoading(true);
    const code = router.query.code;
    const email = router.query.email;
    const body = {
      provided_code: code,
      email: email,
      new_password: data.password,
    };
    api()
      .patch(`/api/v1/auth/verify-forgot-password-code`, body)
      .then((res) => {
        if (res.data.success) {
          toast.success("Reset Password Success", { theme: "colored" });
          router.push("/auth/login");
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <div className="w-full dark:bg-gray-800">
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 w-full">
          <InputField
            type="email"
            placeholder="your@email.id"
            label="Email"
            className="w-full"
            {...register("email")}
            error={errors.email?.message}
            disabled
          />
        </div>
        <div className="mb-4 w-full">
          <InputField
            type="password"
            label="New Password"
            className="w-full"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>
        <div className="mb-4 w-full">
          <InputField
            type="password"
            label="Confirm Password"
            className="w-full"
            {...register("password_confirmation")}
            error={errors.password_confirmation?.message}
          />
        </div>
        <div className="my-4 w-full">
          <Button danger label="Reset Password" block bold />
        </div>
      </form>
    </div>
  );
};
export default ChangePassword;
