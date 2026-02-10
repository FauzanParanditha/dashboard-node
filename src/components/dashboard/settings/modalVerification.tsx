import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import useStore from "@/store";
import { verifyAdminSchema } from "@/utils/schema/admin";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

type Values = {
  provided_code: number; // Keep provided_code as a number
};

const ModalVerification = ({
  isOpen = false,
  setIsOpen,
  email, // Use the email prop directly
}: any) => {
  const {
    register,
    handleSubmit,
    setValue, // Import setValue to update form values
    formState: { errors },
  } = useForm<Values>({
    mode: "onBlur",
    resolver: yupResolver(verifyAdminSchema),
  });

  const { setIsLoading } = useStore();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.slice(0, 1); // Ensure only one character
    setCode(newCode);

    // Update the provided_code value in the form
    const combinedCode = Number(newCode.join(""));
    setValue("provided_code", combinedCode); // Set the value of provided_code

    // Auto-focus to the next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onSubmit = (data: Values) => {
    if (isNaN(data.provided_code) || code.length !== 6) {
      toast.warn("Please fill in all 6 digits of the verification code.", {
        theme: "colored",
      });
      return;
    }

    setIsLoading(true);
    // Proceed with API call
    api()
      .patch("/api/v1/auth/verify-verification-code", {
        email,
        provided_code: data.provided_code,
      })
      .then((res) => {
        if (res.data.success) {
          setIsOpen(false);
          toast.success(res.data.message, { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => {
        setIsLoading(false);
        router.push("/dashboard/home");
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
              Verify Admin
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
              method="patch"
              className="mt-6 flex flex-col items-center"
              onSubmit={handleSubmit(onSubmit)} // Ensure this is correct
            >
              {/* Code Input */}
              <div className="mb-4 flex gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`digit-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-12 w-12 rounded-md border text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    onKeyPress={(e) => {
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-500">
                  Silakan periksa kotak masuk Anda{" "}
                  <span className="font-bold">{email}</span> dan masukkan kode
                  verifikasi untuk memverifikasi bahwa itu adalah Anda.
                </p>
              </div>
              <div className="my-2 w-1/2 md:w-1/4">
                <Button success label={"Verify"} block bold />
              </div>
            </form>
            {/* Log validation errors if any */}
            {errors.provided_code && (
              <span className="text-red-500">
                {errors.provided_code.message}
              </span>
            )}
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};

export default ModalVerification;
