import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import HomeLayout from "@/components/layout/home";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

const AUTH_LAST_EMAIL_KEY = "auth:last-email";
const RESEND_SECONDS = 60;
const GENERIC_MESSAGE =
  "If the email is registered, a verification code will be sent to that address.";

type Values = {
  email: string;
  code: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email field is required."),
  code: yup
    .string()
    .matches(/^\d{6}$/, "OTP code must contain 6 digits.")
    .required("OTP code is required."),
});

const VerifyAccountPage = () => {
  const router = useRouter();
  const { setIsLoading } = useStore();
  const [countdown, setCountdown] = useState(0);
  const {
    control,
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
      code: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryEmail =
      typeof router.query.email === "string" ? router.query.email : "";
    const lastEmail = localStorage.getItem(AUTH_LAST_EMAIL_KEY) || "";
    setValue("email", queryEmail || lastEmail);
  }, [router.query.email, setValue]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const sendCodeLabel = useMemo(() => {
    if (countdown > 0) {
      return `Resend code in ${countdown}s`;
    }
    return "Send code";
  }, [countdown]);

  const sendCode = async () => {
    const email = watch("email");
    if (!email) {
      toast.warn("Please fill in your email first.", { theme: "colored" });
      return;
    }

    setIsLoading(true);
    try {
      await api().patch("/api/v1/auth/send-verification-code", { email });
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_LAST_EMAIL_KEY, email);
      }
      setCountdown(RESEND_SECONDS);
      toast.success(GENERIC_MESSAGE, { theme: "colored" });
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: Values) => {
    setIsLoading(true);
    try {
      await api().patch("/api/v1/auth/verify-verification-code", {
        email: data.email,
        provided_code: Number(data.code),
      });
      router.push("/auth/verification-success");
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Account</title>
        <meta name="description" content="Verify account with OTP code" />
      </Head>
      <HomeLayout>
        <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
          <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-black">
            <div className="mx-auto flex justify-center">
              <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
            </div>

            <h1 className="mt-4 text-center text-xl font-semibold text-slate-800 dark:text-white">
              Verify Account
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-300">
              Enter your email and the 6-digit code to verify your account.
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
                      label="OTP Code"
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

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={countdown > 0}
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200"
                >
                  {countdown > 0 ? `Resend code (${countdown}s)` : sendCodeLabel}
                </button>
                <Button danger label="Verify" block bold />
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

export default VerifyAccountPage;
