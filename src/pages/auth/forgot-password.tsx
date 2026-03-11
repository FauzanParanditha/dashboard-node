import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import HomeLayout from "@/components/layout/home";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

const AUTH_LAST_EMAIL_KEY = "auth:last-email";
const GENERIC_FORGOT_MESSAGE =
  "If the email is registered, a reset code will be sent to that address.";

type Values = {
  email: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email field is required."),
});

const ForgotPasswordPage = () => {
  const { setIsLoading } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastEmail = localStorage.getItem(AUTH_LAST_EMAIL_KEY) || "";
    if (lastEmail) {
      setValue("email", lastEmail);
    }
  }, [setValue]);

  const submit = async (data: Values) => {
    setIsLoading(true);
    try {
      await api().patch("/api/v1/auth/send-forgot-password-code", data);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_LAST_EMAIL_KEY, data.email);
      }
      setSubmitted(true);
      toast.success(GENERIC_FORGOT_MESSAGE, { theme: "colored" });
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password</title>
        <meta name="description" content="Send reset password code" />
      </Head>
      <HomeLayout>
        <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
          <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-black">
            <div className="mx-auto flex justify-center">
              <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
            </div>

            <h1 className="mt-4 text-center text-xl font-semibold text-slate-800 dark:text-white">
              Forgot Password
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-300">
              Enter your email to receive a reset code.
            </p>

            {submitted && (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {GENERIC_FORGOT_MESSAGE}
              </div>
            )}

            <form className="mt-6" onSubmit={handleSubmit(submit)}>
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

              <div className="mt-6">
                <Button danger label="Send Reset Code" block bold />
              </div>
            </form>

            <div className="mt-3 grid gap-3">
              <Link
                href={`/auth/reset-password${watch("email") ? `?email=${encodeURIComponent(watch("email"))}` : ""}`}
                className="text-center text-sm text-slate-600 hover:underline dark:text-slate-300"
              >
                I already have a reset code
              </Link>
              <Link
                href="/auth/login"
                className="text-center text-sm text-slate-600 hover:underline dark:text-slate-300"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </HomeLayout>
    </>
  );
};

export default ForgotPasswordPage;
