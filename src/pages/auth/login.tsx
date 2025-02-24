import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import HomeLayout from "@/components/layout/home";
import { useUserContext } from "@/context/user";
import useStore from "@/store";
import { nextUrlSchema } from "@/utils/schema/url";
import { tokenName } from "@/utils/var";
import { yupResolver } from "@hookform/resolvers/yup";
import { setCookie } from "cookies-next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

type Values = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email field is required."),
  password: yup.string().required("Password field is required."),
});

const LoginPage = () => {
  const router = useRouter();
  const { auth, revalidate } = useUserContext();
  const { setIsLoading } = useStore();
  const { user } = useUserContext();

  useEffect(() => {
    console.log("Auth status:", auth);
    console.log("User data:", user);

    if (auth == "authenticated") {
      router.replace("/dashboard/home");
    }
  }, [auth, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const submit = async (data: Values) => {
    setIsLoading(true);
    api()
      .post("/adm/auth/login", data)
      .then(async (res) => {
        if (res.data.success) {
          setCookie(tokenName, `Bearer ${res.data.token}`);
          await revalidate({}, true);

          toast.success("login success", { theme: "colored" });
          try {
            const sanitizedNext = await nextUrlSchema.validate(
              router.query?.next,
            );

            // Redirect to the validated path
            router.push(sanitizedNext);
          } catch (err) {
            if (err instanceof yup.ValidationError) {
              // Handle Yup validation error
              toast.error(`Validation error: ${err.message}`, {
                theme: "colored",
              });
            } else {
              // Handle other unknown errors
              toast.error(`An unexpected error occurred: ${err}`, {
                theme: "colored",
              });
            }

            // Redirect to the default path on validation failure
            router.push("/dashboard/home");
          }
        }
      })
      .catch((err: any) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Head>
        <title>Login Page</title>
        <meta
          name="description"
          content="Welcome to the login page of My Next.js App!"
        />
      </Head>
      <HomeLayout>
        <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
          <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-black">
            <div className="mx-auto flex justify-center">
              <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
            </div>

            <form className="mt-6" onSubmit={handleSubmit(submit)}>
              <div className="mb-4 w-full">
                <InputField
                  type="text"
                  placeholder="your@email.id"
                  label="Email"
                  className="w-full"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div className="mt-4 w-full">
                <div className="flex items-center justify-between pb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm text-slate-500 dark:text-white"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-red-600 hover:underline dark:text-white"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <InputField
                  type="password"
                  className="w-full"
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>

              <div className="mt-6">
                <Button danger label="Sign in" block bold />
              </div>
            </form>

            {/* <div className="flex items-center justify-between mt-4">
            <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/5"></span>

            <a
              href="#"
              className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline"
            >
              or login with
            </a>

            <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/5"></span>
          </div>

          <div className="flex items-center mt-6 -mx-2">
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 mx-2 text-sm font-medium text-white transition-colors duration-300 transform bg-slate-400 rounded-lg hover:bg-blue-400 focus:bg-blue-400 focus:outline-none"
            >
              <img src="/img/uid.png" className="h-5" alt="uid" />
              <span className="hidden mx-2 sm:inline">Sign in with U.id</span>
            </button>
          </div> */}

            {/* <p className="mt-8 text-xs font-light text-center text-gray-400">
                        {" "}
                        Don&apos;t have an account?{" "}
                        <a
                            href="#"
                            className="font-medium text-gray-700 dark:text-gray-200 hover:underline"
                        >
                            Create One
                        </a>
                    </p> */}
          </div>
        </div>
      </HomeLayout>
    </>
  );
};

export default LoginPage;
