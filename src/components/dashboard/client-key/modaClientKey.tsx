import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import TextArea from "@/components/form/text-area";
import useStore from "@/store";
import { createClientKeySchema } from "@/utils/schema/client-key";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  clientId: string;
  publicKey: string;
  active: boolean;
};

const options = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const ModalClientKey = ({ isOpen = false, setIsOpen, revalidate }: any) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(createClientKeySchema),
  });

  const { setIsLoading } = useStore();
  const [userOptions, setUserOptions] = useState([]);
  const router = useRouter();

  //create new data
  const onSubmit = (data: any) => {
    setIsLoading(true);
    api()
      .post("api/v1/client-key", data)
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          reset();
          toast.success("Create Client Key success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => {
        setIsLoading(false);
        router.push("/dashboard/client-key");
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
              Create Client Key
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
                    placeholder="CLNT-XXXX"
                    label="Client Key"
                    {...register("clientId")}
                    error={errors.clientId?.message}
                  />
                </div>
                <div className="mb-4 pr-3">
                  <TextArea
                    className="w-full"
                    placeholder="PUB-XXXX"
                    label="Public Key"
                    {...register("publicKey")}
                    error={errors.publicKey?.message}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1">
                <div className="mb-4 pr-3">
                  <Controller
                    control={control}
                    name="active"
                    render={({ field: { onChange, value } }) => (
                      <SelectField
                        name="active"
                        label="Status"
                        required
                        options={options}
                        value={value}
                        onChange={onChange}
                        error={errors.active?.message}
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

export default ModalClientKey;
