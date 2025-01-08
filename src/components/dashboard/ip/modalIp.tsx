import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import useStore from "@/store";
import { ipValidator } from "@/utils/schema/ip";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  ipAddress: string;
};

const ModalIp = ({
  isOpen = false,
  setIsOpen,
  isUpdate,
  defaultValue,
  revalidate,
  id,
}: any) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(ipValidator),
  });
  const { setIsLoading } = useStore();

  useEffect(() => {
    //add default value
    reset({ ...defaultValue });
  }, [isUpdate, defaultValue]);

  //create new data
  const onSubmit = (data: any) => {
    setIsLoading(true);
    api()
      .post("/api/v1/whitelist", data)
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          toast.success("Create IP success", { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
  };

  //update data
  const updateData = (data: any) => {
    setIsLoading(true);
    api()
      .put("/api/v1/whitelist/" + id, data)
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          toast.success("Update IP success", { theme: "colored" });
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
              {isUpdate ? "Update IP" : "Create IP"}
              <button
                type="button"
                className="rounded-full bg-rose-50 p-1 text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <HiOutlineX className="h-5 w-5 text-rose-600" />
              </button>
            </DialogTitle>
            <div className="my-1 border border-red-800"></div>
            <form
              method="post"
              onSubmit={handleSubmit(isUpdate ? updateData : onSubmit)}
            >
              <div className="grid grid-cols-1">
                <div className="mb-4 pr-3">
                  <InputField
                    className="w-full"
                    placeholder="127.0.0.1"
                    label="IP"
                    {...register("ipAddress")}
                    error={errors.ipAddress?.message}
                  />
                </div>
              </div>
              <div className="my-2 w-1/2 md:w-1/4">
                <Button
                  success
                  label={isUpdate ? "Update Data" : "Create Data"}
                  block
                  bold
                />
              </div>
            </form>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};
export default ModalIp;
