import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import useStore from "@/store";
import { createClientSchema } from "@/utils/schema/client";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  name: string;
  notifyUrl?: string;
  userId: string;
};

const ModalClient = ({ isOpen = false, setIsOpen, revalidate }: any) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(createClientSchema),
  });

  const { setIsLoading } = useStore();
  const [userOptions, setUserOptions] = useState([]);
  const router = useRouter();

  const fetchUsers = () => {
    setIsLoading(true);
    api()
      .get("api/v1/users")
      .then((res) => {
        if (res.data.success) {
          const users = res.data.data.map((user: any) => ({
            label: user.fullName,
            value: user._id,
          }));
          setUserOptions(users);
        }
      })
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //create new data
  const onSubmit = (data: any) => {
    setIsLoading(true);
    api()
      .post("api/v1/client", data)
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          reset();
          toast.success("Create Client success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => {
        setIsLoading(false);
        router.push("/dashboard/client");
      });
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
              Create Client
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
                    placeholder="ex: Apps-1"
                    label="Name"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>
                <div className="mb-4 pr-3">
                  <InputField
                    className="w-full"
                    placeholder="https://example.id/callback"
                    label="Notify Url"
                    {...register("notifyUrl")}
                    error={errors.notifyUrl?.message}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1">
                <div className="mb-4 pr-3">
                  <Controller
                    control={control}
                    name="userId"
                    render={({ field: { onChange, value } }) => (
                      <SelectField
                        name="userId"
                        label="Assign User"
                        required
                        options={userOptions}
                        value={value}
                        onChange={onChange}
                        error={errors.userId?.message}
                      />
                    )}
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

export default ModalClient;
