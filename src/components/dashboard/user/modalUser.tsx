import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import useStore from "@/store";
import { createAdminSchema } from "@/utils/schema/admin";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  fullName: string;
  email: string;
  role: string;
  password: string;
  password_confirmation?: string;
};

const ModalUser = ({ isOpen = false, setIsOpen, revalidate }: any) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(createAdminSchema),
  });

  const { setIsLoading } = useStore();

  //create new data
  const onSubmit = (data: any) => {
    setIsLoading(true);
    api()
      .post("api/v1/register", data)
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          reset();
          toast.success("Create User success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Transition as={Dialog} show={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="my-8 inline-block w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-800">
            <DialogTitle
              as="h3"
              className="flex justify-between py-2 text-lg font-medium leading-6 text-gray-900 dark:text-white"
            >
              Create User
              <button
                type="button"
                className="rounded-full bg-rose-50 p-1 text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  reset();
                }}
              >
                <HiOutlineX className="h-5 w-5 text-rose-600" />
              </button>
            </DialogTitle>
            <div className="my-1 border border-red-800"></div>
            <form method="post" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="mb-4 pr-2">
                  <InputField
                    className="w-full"
                    placeholder="ex: alfa"
                    label="Full Name"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />
                </div>
                <div className="mb-4 pr-3">
                  <InputField
                    className="w-full"
                    placeholder="your@me.id"
                    label="Email"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="mb-4 pr-2">
                  <InputField
                    className="w-full"
                    placeholder="ex: user"
                    label="Role"
                    {...register("role")}
                    error={errors.role?.message}
                  />
                </div>
                <div className="mb-4 pr-3">
                  <InputField
                    type="password"
                    className="w-full"
                    label="Password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                </div>
                <div className="mb-4 pr-3">
                  <InputField
                    type="password"
                    className="w-full"
                    label="Password Confirmation"
                    {...register("password_confirmation")}
                    error={errors.password_confirmation?.message}
                  />
                </div>
              </div>
              <div className="my-2 w-1/2 md:w-1/4">
                <Button success label={"Create Data"} block bold />
              </div>
            </form>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};

export default ModalUser;
