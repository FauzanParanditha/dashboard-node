import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import useStore from "@/store";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

type Values = {
  email: string;
};

const schema = yup.object({
  email: yup
    .string()
    .email("Email must be a valid email address.")
    .required("Email field is required."),
});

const SendEmail = () => {
  const router = useRouter();
  const { setIsLoading } = useStore();

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
      .patch("/api/v1/auth/send-forgot-password-code", data)
      .then(async (res) => {
        if (res.data.success) {
          toast.success(res.data.message, { theme: "colored" });
          router.push("/auth/login");
        }
      })
      .catch((err: any) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="w-full dark:bg-gray-800">
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

        <div className="mt-6">
          <Button danger label="Submit" block bold />
        </div>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <span className="w-1/5 border-b lg:w-1/5 dark:border-gray-600"></span>

        <a
          href="#"
          className="text-center text-xs uppercase text-gray-500 hover:underline dark:text-gray-400"
        >
          or
        </a>

        <span className="w-1/5 border-b lg:w-1/5 dark:border-gray-400"></span>
      </div>

      <div className="-mx-2 mt-3 flex items-center">
        <Link
          href={"/auth/login"}
          className="mx-2 flex w-full transform items-center justify-center rounded-lg bg-slate-400 px-6 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-400 focus:bg-blue-400 focus:outline-none"
        >
          <span className="mx-2 hidden sm:inline">Log in</span>
        </Link>
      </div>
    </div>
  );
};

export default SendEmail;
