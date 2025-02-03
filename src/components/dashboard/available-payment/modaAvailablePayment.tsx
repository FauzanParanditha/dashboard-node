import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import InputField from "@/components/form/input";
import SelectField from "@/components/form/select";
import useStore from "@/store";
import { createAvailablePaymentSchema } from "@/utils/schema/available-payment";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  name: string;
  image?: File | null;
  category: string;
  active: boolean;
};

const options = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const ModalAvailablePayment = ({
  isOpen = false,
  setIsOpen,
  revalidate,
}: any) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(createAvailablePaymentSchema),
  });

  const { setIsLoading } = useStore();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setValue("image", file); // Set the selected file in the form state
  };

  //create new data
  const onSubmit = (data: Values) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("active", JSON.stringify(data.active));
    if (data.image) {
      formData.append("image", data.image); // Append the file
    }

    setIsLoading(true);
    api()
      .post("api/v1/available-payment/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.success) {
          revalidate({}, true);
          setIsOpen(false);
          reset();
          toast.success("Create Available Payment success", {
            theme: "colored",
          });
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
              Create Availabel Payment
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
                    label="Category"
                    placeholder="sample"
                    className="w-full"
                    {...register("category")}
                    error={errors.category?.message}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1">
                <div className="mb-4 pr-2">
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
                {/* <div className="mb-4 pr-3">
                  <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">
                    Upload Picture
                  </label>
                  <input
                    type="file"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-black dark:file:text-white dark:hover:file:bg-slate-500"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {errors.image && (
                    <p className="text-sm text-red-500">
                      {errors.image.message}
                    </p>
                  )}
                </div> */}
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

export default ModalAvailablePayment;
