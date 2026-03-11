import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import HomeLayout from "@/components/layout/home";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import YupPassword from "yup-password";

YupPassword(yup);

const AUTH_LAST_EMAIL_KEY = "auth:last-email";

type Values = {
  email: string;
  code: string;
  password: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email field is required."),
  code: yup
    .string()
    .matches(/^\d{6}$/, "Code must contain 6 digits.")
    .required("Code is required."),
  password: yup
    .string()
    .min(8, "min 8 character")
    .minLowercase(1, "password must contain at least 1 lower case letter")
    .minUppercase(1, "password must contain at least 1 upper case letter")
    .minNumbers(1, "password must contain at least 1 number")
    .minSymbols(1, "password must contain at least 1 special character")
    .required("Password is required"),
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const { setIsLoading } = useStore();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      code: "",
      password: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryEmail =
      typeof router.query.email === "string" ? router.query.email : "";
    const lastEmail = localStorage.getItem(AUTH_LAST_EMAIL_KEY) || "";
    setValue("email", queryEmail || lastEmail);
    if (typeof router.query.code === "string") {
      setValue("code", router.query.code);
    }
  }, [router.query.code, router.query.email, setValue]);

  const onSubmit = async (data: Values) => {
    setIsLoading(true);
    try {
      await api().patch("/api/v1/auth/verify-forgot-password-code", {
        email: data.email,
        provided_code: data.code,
        new_password: data.password,
      });
      toast.success("Password reset successful.", { theme: "colored" });
      router.push("/auth/login");
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
        <meta name="description" content="Reset password using code" />
      </Head>
      <HomeLayout>
        <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
          <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-black">
            <div className="mx-auto flex justify-center">
              <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
            </div>

            <h1 className="mt-4 text-center text-xl font-semibold text-slate-800 dark:text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-300">
              Enter your email, reset code, and new password.
            </p>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 w-full">
                <InputField
                  type="email"
                  placeholder="your@email.id"
                  label="Email"
                  className="w-full"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div className="mb-4 w-full">
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <InputField
                      type="text"
                      placeholder="123456"
                      label="Code"
                      className="w-full"
                      inputMode="numeric"
                      maxLength={6}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      error={errors.code?.message}
                    />
                  )}
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

              <div className="mt-6">
                <Button danger label="Reset Password" block bold />
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
              <Link href="/auth/login" className="hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </HomeLayout>
    </>
  );
};

export default ResetPasswordPage;
